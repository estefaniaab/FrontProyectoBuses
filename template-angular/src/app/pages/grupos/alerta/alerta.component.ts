import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';

interface Ruta { id: number; nombre: string; }
interface AlertaMasiva {
  id?: number;
  titulo: string;
  mensaje: string;
  urgente: boolean;
  alcance: string;
  rutaId?: number;
  zona?: string;
  totalDestinatarios: number;
  totalLeidos: number;
  enviada: boolean;
  fechaProgramada?: string;
  fechaCreacion?: string;
}

@Component({
  selector: 'app-alerta-masiva',
  templateUrl: './alerta.component.html',
  styleUrls: ['./alerta.component.scss'],
})
export class AlertaComponent implements OnInit {
  alertas: AlertaMasiva[] = [];
  rutas: Ruta[] = [];
  cargando = false;
  mostrarFormulario = false;

  // HU-ENTR-3-008: contador de destinatarios preview
  contadorDestinatarios: number | null = null;
  calculandoDestinatarios = false;

  nueva: Partial<AlertaMasiva> = {
    titulo:  '',
    mensaje: '',
    urgente: false,
    alcance: 'todos',
  };

  get usuarioActual(): string {
    const session = localStorage.getItem('session');
    return session ? JSON.parse(session)?.id ?? '' : '';
  }

  get token(): string {
    const session = localStorage.getItem('session');
    return session ? `Bearer ${JSON.parse(session)?.token ?? ''}` : '';
  }

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.cargarAlertas();
    this.cargarRutas();
  }

  cargarAlertas(): void {
    this.cargando = true;
    this.http.get<AlertaMasiva[]>(`${environment.url_ms_business}/alertas`, {
      headers: { Authorization: this.token },
    }).subscribe({
      next: a => { this.alertas = a; this.cargando = false; },
      error: () => { this.cargando = false; },
    });
  }

  cargarRutas(): void {
    this.http.get<Ruta[]>(`${environment.url_ms_business}/rutas`, {
      headers: { Authorization: this.token },
    }).subscribe({ next: r => (this.rutas = r) });
  }

  // HU-ENTR-3-008: calcular destinatarios al cambiar alcance/ruta/zona
  calcularDestinatarios(): void {
    this.contadorDestinatarios = null;
    this.calculandoDestinatarios = true;

    let url = `${environment.url_ms_business}/alertas/preview-destinatarios?alcance=${this.nueva.alcance}`;
    if (this.nueva.alcance === 'por_ruta' && this.nueva.rutaId) {
      url += `&rutaId=${this.nueva.rutaId}`;
    }
    if (this.nueva.alcance === 'por_zona' && this.nueva.zona?.trim()) {
      url += `&zona=${encodeURIComponent(this.nueva.zona)}`;
    }

    this.http.get<{ total: number }>(url, {
      headers: { Authorization: this.token },
    }).subscribe({
      next: res => { this.contadorDestinatarios = res.total; this.calculandoDestinatarios = false; },
      error: () => { this.calculandoDestinatarios = false; },
    });
  }

  onAlcanceChange(): void {
    this.contadorDestinatarios = null;
    if (this.nueva.alcance === 'todos') this.calcularDestinatarios();
  }

  enviar(): void {
    if (!this.nueva.titulo || !this.nueva.mensaje) {
      Swal.fire('Error', 'El título y el mensaje son obligatorios.', 'error');
      return;
    }
    if (this.nueva.alcance === 'por_ruta' && !this.nueva.rutaId) {
      Swal.fire('Error', 'Selecciona una ruta.', 'error');
      return;
    }
    if (this.nueva.alcance === 'por_zona' && !this.nueva.zona?.trim()) {
      Swal.fire('Error', 'Ingresa una zona (barrio o ciudad).', 'error');
      return;
    }

    const texto = this.contadorDestinatarios !== null
      ? `Se enviará a ${this.contadorDestinatarios} destinatarios.`
      : 'Se enviará a los destinatarios del alcance seleccionado.';

    Swal.fire({
      title: '¿Confirmar envío?',
      text: texto,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Enviar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#f5365c',
    }).then(result => {
      if (!result.isConfirmed) return;

      const dto = { ...this.nueva, emisorUsuarioId: this.usuarioActual };

      this.http.post<AlertaMasiva>(`${environment.url_ms_business}/alertas`, dto, {
        headers: { Authorization: this.token },
      }).subscribe({
        next: () => {
          Swal.fire('¡Enviado!', 'La alerta masiva fue enviada correctamente.', 'success');
          this.mostrarFormulario = false;
          this.nueva = { titulo: '', mensaje: '', urgente: false, alcance: 'todos' };
          this.contadorDestinatarios = null;
          this.cargarAlertas();
        },
        error: err => Swal.fire('Error', err.error?.message || 'No se pudo enviar.', 'error'),
      });
    });
  }

  // HU-ENTR-3-008: marcar alerta como leída
  marcarAlertaLeida(alertaId: number): void {
    this.http.patch(`${environment.url_ms_business}/alertas/${alertaId}/leido`, {}, {
      headers: { Authorization: this.token },
    }).subscribe({
      next: () => {
        const alerta = this.alertas.find(a => a.id === alertaId);
        if (alerta) alerta.totalLeidos = (alerta.totalLeidos || 0) + 1;
      },
      error: () => {},
    });
  }

  porcentajeLeidos(alerta: AlertaMasiva): number {
    if (!alerta.totalDestinatarios) return 0;
    return Math.round((alerta.totalLeidos / alerta.totalDestinatarios) * 100);
  }
}
