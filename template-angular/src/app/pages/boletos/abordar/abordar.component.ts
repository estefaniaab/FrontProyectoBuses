import { Component, OnInit }             from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router }                         from '@angular/router';
import {
  BoletosService,
} from 'src/app/services/Boletos/boletos.service';
import {
  MetodoPagoCiudadanoBasic, ParaderoBasic,
} from 'src/app/models/Boletos/boleto.model';
import { ProgramacionRuta }              from 'src/app/models/Programaciones-ruta/programacion-ruta.model';
import Swal                              from 'sweetalert2';

@Component({
  selector:    'app-abordar',
  templateUrl: './abordar.component.html',
  styleUrls:   ['./abordar.component.scss'],
})
export class AbordajeComponent implements OnInit {
  form!: FormGroup;
  ciudadanoId?: number;

  programaciones: ProgramacionRuta[]         = [];
  paraderos:      ParaderoBasic[]            = [];
  metodosPago:    MetodoPagoCiudadanoBasic[] = [];

  programacionSeleccionada?: ProgramacionRuta;
  metodoPagoSeleccionado?:   MetodoPagoCiudadanoBasic;

  constructor(
    private fb:      FormBuilder,
    private service: BoletosService,
    private router:  Router,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      programacionRutaId:    [null, [Validators.required]],
      metodoPagoCiudadanoId: [null, [Validators.required]],
      paraderoAbordajeId:    [null, [Validators.required]],
    });

    this.resolverCiudadano();
    this.cargarProgramaciones();
    this.cargarParaderos();
  }

  private resolverCiudadano(): void {
    // ── Mismo patrón que recargas ──────────────────────────────────────
    let usuarioId: string | null = null;

    // Intenta con 'user' (clave que usa el login principal)
    const userRaw = localStorage.getItem('user');
    if (userRaw) {
      try {
        const user = JSON.parse(userRaw);
        usuarioId = user?.id || null;
      } catch { }
    }

    // Fallback: intenta con 'session'
    if (!usuarioId) {
      const sessionRaw = localStorage.getItem('session');
      if (sessionRaw) {
        try {
          const session = JSON.parse(sessionRaw);
          if (session?.id) {
            usuarioId = session.id;
          } else if (session?.token) {
            const payload = JSON.parse(atob(session.token.split('.')[1]));
            usuarioId = payload.id || payload.sub || null;
          }
        } catch { }
      }
    }

    if (!usuarioId) {
      console.error('No se pudo obtener el usuarioId del localStorage');
      return;
    }

    this.service.getCiudadanoByUsuarioId(usuarioId).subscribe({
      next: (c) => {
        this.ciudadanoId = c.id;
        this.cargarMetodosPago(); // ← carga métodos DESPUÉS de tener el id
      },
      error: (err) => console.error('Error al obtener ciudadano', err),
    });
  }

  cargarProgramaciones(): void {
    this.service.getProgramacionesEnCurso().subscribe({
      next:  (data) => (this.programaciones = data),
      error: (err)  => console.error('Error al obtener programaciones', err),
    });
  }

  cargarParaderos(): void {
    this.service.getParaderos().subscribe({
      next:  (data) => (this.paraderos = data),
      error: (err)  => console.error('Error al obtener paraderos', err),
    });
  }

  cargarMetodosPago(): void {
    if (!this.ciudadanoId) return;
    this.service.getMetodosPagoByCiudadano(this.ciudadanoId).subscribe({
      next: (data) => {
        this.metodosPago = data;
        console.log('Métodos de pago cargados:', data); // ← para verificar
      },
      error: (err) => console.error('Error al obtener métodos de pago', err),
    });
  }
  onProgramacionChange(): void {
    const id = this.form.get('programacionRutaId')?.value;
    this.programacionSeleccionada = this.programaciones.find(p => p.id === id);
  }

  onMetodoPagoChange(): void {
    const id = this.form.get('metodoPagoCiudadanoId')?.value;
    this.metodoPagoSeleccionado = this.metodosPago.find(m => m.id === id);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      Swal.fire('Atención', 'Por favor completa todos los campos obligatorios.', 'warning');
      return;
    }
    if (!this.ciudadanoId) {
      Swal.fire('Error', 'No se pudo identificar al ciudadano. Vuelve a iniciar sesión.', 'error');
      return;
    }

    const raw = this.form.getRawValue();
    const dto = {
      ciudadanoId:          this.ciudadanoId,
      programacionRutaId:   Number(raw.programacionRutaId),
      metodoPagoCiudadanoId: Number(raw.metodoPagoCiudadanoId),
      paraderoAbordajeId:   Number(raw.paraderoAbordajeId),
    };

    this.service.abordar(dto).subscribe({
      next: (res) => {
        const saldoMsg = res.saldoRestante !== null && res.saldoRestante !== undefined
          ? `Saldo restante: $${Number(res.saldoRestante).toFixed(2)}`
          : '';
        Swal.fire({
          title: '¡Abordaje exitoso!',
          html:  `${res.mensaje}${saldoMsg ? '<br><strong>' + saldoMsg + '</strong>' : ''}`,
          icon:  'success',
          confirmButtonText: 'Ver mis boletos',
        }).then(() => this.router.navigate(['/boletos/list']));
      },
      error: (err) =>
        Swal.fire('Error', err.error?.message || 'No se pudo procesar el abordaje.', 'error'),
    });
  }
}
