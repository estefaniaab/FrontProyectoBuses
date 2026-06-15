import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MensajesService } from 'src/app/services/Mensajes/mensajes.service';
import { SecurityService } from 'src/app/services/security.service';
import { Mensaje } from 'src/app/models/Mensaje/mensaje.model';

@Component({
  selector: 'app-bandeja',
  templateUrl: './bandeja.component.html',
  styleUrls: ['./bandeja.component.scss']
})
export class BandejaComponent implements OnInit, OnDestroy {

  usuarioActual: any = null;
  recibidos: Mensaje[] = [];
  enviados: Mensaje[] = [];
  tabActiva: 'recibidos' | 'enviados' = 'recibidos';
  noLeidos = 0;

  busqueda = '';
  usuariosBuscados: any[] = [];
  buscando = false;

  private subs: Subscription[] = [];

  constructor(
    private mensajesService: MensajesService,
    private securityService: SecurityService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.usuarioActual = this.securityService.activeUserSession;
    if (!this.usuarioActual?.id) return;

    this.mensajesService.conectar(this.usuarioActual.id);
    this.cargarBandeja();

    // Escuchar mensajes nuevos en tiempo real
    this.subs.push(
      this.mensajesService.onMensajeRecibido().subscribe(() => {
        this.cargarBandeja();
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  cargarBandeja(): void {
    const id = this.usuarioActual.id;

    this.mensajesService.getRecibidos(id).subscribe(data => {
      this.recibidos = this.agruparPorRemitente(data);
    });

    this.mensajesService.getEnviados(id).subscribe(data => {
      this.enviados = data;
    });

    this.mensajesService.getNoLeidos(id).subscribe(n => {
      this.noLeidos = n;
    });
  }

  private agruparPorRemitente(mensajes: Mensaje[]): Mensaje[] {
    const porUsuario = new Map<string, Mensaje>();

    for (const msg of mensajes) {
      const existente = porUsuario.get(msg.emisorId);
      if (!existente || new Date(msg.fechaEnvio) > new Date(existente.fechaEnvio)) {
        porUsuario.set(msg.emisorId, msg);
      }
    }

    return Array.from(porUsuario.values())
      .sort((a, b) => new Date(b.fechaEnvio).getTime() - new Date(a.fechaEnvio).getTime());
  }
  buscarUsuarios(): void {
    if (!this.busqueda.trim()) {
      this.usuariosBuscados = [];
      return;
    }
    this.buscando = true;
    this.mensajesService.buscarUsuarios(this.busqueda).subscribe({
      next: (users) => {
        // Excluir al usuario actual
        this.usuariosBuscados = users.filter(u => u.id !== this.usuarioActual.id);
        this.buscando = false;
      },
      error: () => { this.buscando = false; }
    });
  }

  irAlChat(userId: string): void {
    this.busqueda = '';
    this.usuariosBuscados = [];
    this.router.navigate(['/mensajes/chat', userId]);
  }

  getOtroUsuarioId(mensaje: Mensaje): string {
    return mensaje.emisorId === this.usuarioActual.id
      ? mensaje.destinatarioId
      : mensaje.emisorId;
  }

  usuariosCache: Map<string, any> = new Map();

  cargarNombreUsuario(id: string): void {
    if (this.usuariosCache.has(id)) return;
    this.mensajesService.getUserById(id).subscribe({
      next: (user) => this.usuariosCache.set(id, user),
      error: () => this.usuariosCache.set(id, { name: id })
    });
  }

  getNombreUsuario(id: string): string {
    this.cargarNombreUsuario(id);
    return this.usuariosCache.get(id)?.name || id;
  }
}
