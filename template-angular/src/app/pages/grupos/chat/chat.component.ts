import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { GrupoService } from 'src/app/services/Grupo/grupo.service';
import { Grupo } from 'src/app/models/Grupos/grupo.model';

interface Mensaje {
  id?: number;
  grupoId: number;
  usuarioId: string;
  nombreUsuario: string;
  contenido: string;
  fechaEnvio?: string;
  eliminado?: boolean;
  lecturas?: number;
  leido?: boolean;
}

@Component({
  selector: 'app-chat-grupo',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('mensajesContainer') mensajesContainer!: ElementRef;

  grupo?: Grupo;
  grupoId!: number;
  mensajes: Mensaje[] = [];
  nuevoMensaje = '';
  socket!: Socket;
  conectado = false;
  errorConexion = false;
  sinAcceso = false;
  soloLectura = false;

  get usuarioActual(): { id: string; nombre: string } {
    const session = localStorage.getItem('session');
    if (!session) return { id: '', nombre: 'Anónimo' };
    const data = JSON.parse(session);
    return { id: data?.id ?? '', nombre: data?.name ?? 'Anónimo' };
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private grupoService: GrupoService,
  ) {}

  ngOnInit(): void {
    this.grupoId = Number(this.route.snapshot.params['id']);
    this.cargarGrupo();
    // Verificar si es solo lectura
    this.grupoService.verificarMembresia(this.grupoId, this.usuarioActual.id).subscribe({
      next: ({ soloLectura }) => {
        this.soloLectura = soloLectura;
        this.conectarSocket();
      },
      error: () => this.conectarSocket(),
    });
  }

  ngAfterViewChecked(): void { this.scrollAlFinal(); }

  ngOnDestroy(): void {
    if (this.socket) {
      this.socket.emit('leaveGrupo', { grupoId: this.grupoId });
      this.socket.disconnect();
    }
  }

  cargarGrupo(): void {
    this.grupoService.view(this.grupoId).subscribe({ next: g => (this.grupo = g) });
  }

  conectarSocket(): void {
    const wsUrl = environment.url_ms_business.replace('/api', '');
    this.socket = io(`${wsUrl}/chat`, { transports: ['websocket'] });

    this.socket.on('connect', () => {
      this.conectado = true;
      this.errorConexion = false;
      this.socket.emit('joinGrupo', { grupoId: this.grupoId, usuarioId: this.usuarioActual.id });
    });

    this.socket.on('disconnect', () => { this.conectado = false; });
    this.socket.on('connect_error', () => { this.errorConexion = true; });

    this.socket.on('historialMensajes', (mensajes: Mensaje[]) => {
      this.mensajes = mensajes;
      // Marcar mensajes recibidos como leídos
      setTimeout(() => this.marcarMensajesLeidos(), 500);
    });

    this.socket.on('nuevoMensaje', (mensaje: Mensaje) => {
      this.mensajes.push(mensaje);
      // Marcar como leído automáticamente si estamos en el chat
      if (mensaje.id && !this.esMio(mensaje)) {
        this.socket.emit('marcarLeido', {
          mensajeId: mensaje.id,
          usuarioId: this.usuarioActual.id,
          grupoId:   this.grupoId,
        });
      }
    });

    // HU-ENTR-3-005: Actualizar doble check
    this.socket.on('mensajeLeido', (data: { mensajeId: number; lecturas: number }) => {
      const msg = this.mensajes.find(m => m.id === data.mensajeId);
      if (msg) msg.lecturas = data.lecturas;
    });

    // HU-ENTR-3-005: Mensaje eliminado
    this.socket.on('mensajeEliminado', (data: { mensajeId: number }) => {
      const msg = this.mensajes.find(m => m.id === data.mensajeId);
      if (msg) {
        msg.eliminado = true;
        msg.contenido = '🚫 Mensaje eliminado';
      }
    });

    this.socket.on('errorChat', () => { this.sinAcceso = true; this.socket.disconnect(); });
    this.socket.on('errorMensaje', (err: { message: string }) => console.error(err.message));
  }

  private marcarMensajesLeidos(): void {
    for (const msg of this.mensajes) {
      if (msg.id && !this.esMio(msg) && !msg.leido) {
        this.socket.emit('marcarLeido', {
          mensajeId: msg.id,
          usuarioId: this.usuarioActual.id,
          grupoId:   this.grupoId,
        });
      }
    }
  }

  enviar(): void {
    if (!this.nuevoMensaje.trim() || !this.conectado || this.sinAcceso || this.soloLectura) return;

    const { id, nombre } = this.usuarioActual;
    this.socket.emit('enviarMensaje', {
      grupoId:       this.grupoId,
      usuarioId:     id,
      nombreUsuario: nombre,
      contenido:     this.nuevoMensaje.trim(),
    });
    this.nuevoMensaje = '';
  }

  eliminarMensaje(mensaje: Mensaje): void {
    if (!mensaje.id) return;
    this.socket.emit('eliminarMensaje', {
      mensajeId: mensaje.id,
      usuarioId: this.usuarioActual.id,
      grupoId:   this.grupoId,
    });
  }

  puedeEliminar(mensaje: Mensaje): boolean {
    return mensaje.usuarioId === this.usuarioActual.id;
  }

  esMio(mensaje: Mensaje): boolean {
    return mensaje.usuarioId === this.usuarioActual.id;
  }

  scrollAlFinal(): void {
    try {
      const el = this.mensajesContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }

  back(): void { this.router.navigate(['/grupos/list']); }

  enviarConEnter(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.enviar();
    }
  }
}
