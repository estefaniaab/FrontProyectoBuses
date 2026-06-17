import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
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

interface LecturaDetalle {
  usuarioId: string;
  fechaLectura: string;
  nombreUsuario?: string;
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
  esAdmin = false; // FIX: para permitir eliminar mensajes de otros

  // ── Reenvío ───────────────────────────────────────────────────────────────
  mensajeSeleccionado?: Mensaje;
  mostrarModalReenvio = false;
  misGrupos: (Grupo & { rol?: string })[] = [];
  gruposSeleccionados: Set<number> = new Set();
  reenviando = false;

  // ── Lecturas ──────────────────────────────────────────────────────────────
  mostrarLecturas = false;
  lecturasDetalle: LecturaDetalle[] = [];
  cargandoLecturas = false;
  mensajeLecturas?: Mensaje;

  get usuarioActual(): { id: string; nombre: string } {
    const session = localStorage.getItem('session');
    if (!session) return { id: '', nombre: 'Anónimo' };
    const data = JSON.parse(session);
    return { id: data?.id ?? '', nombre: data?.name ?? 'Anónimo' };
  }

  get token(): string {
    const session = localStorage.getItem('session');
    return session ? `Bearer ${JSON.parse(session)?.token ?? ''}` : '';
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private grupoService: GrupoService,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    this.grupoId = Number(this.route.snapshot.params['id']);
    this.cargarGrupo();

    this.grupoService.verificarMembresia(this.grupoId, this.usuarioActual.id).subscribe({
      next: ({ soloLectura }) => {
        this.soloLectura = soloLectura;
        this.conectarSocket();
      },
      error: () => this.conectarSocket(),
    });

    this.grupoService.misGrupos(this.usuarioActual.id).subscribe({
      next: grupos => (this.misGrupos = grupos),
    });

    // FIX: verificar si el usuario es admin del grupo
    this.grupoService.listarMiembros(this.grupoId).subscribe({
      next: miembros => {
        const yo = miembros.find(m => m.usuarioId === this.usuarioActual.id);
        this.esAdmin = yo?.rol === 'administrador';
      },
      error: () => {},
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
      setTimeout(() => this.marcarMensajesLeidos(), 500);
    });

    this.socket.on('nuevoMensaje', (mensaje: Mensaje) => {
      this.mensajes.push(mensaje);
      if (mensaje.id && !this.esMio(mensaje)) {
        this.socket.emit('marcarLeido', {
          mensajeId: mensaje.id,
          usuarioId: this.usuarioActual.id,
          grupoId:   this.grupoId,
        });
      }
    });

    this.socket.on('mensajeLeido', (data: { mensajeId: number; lecturas: number }) => {
      const msg = this.mensajes.find(m => m.id === data.mensajeId);
      if (msg) msg.lecturas = data.lecturas;
    });

    this.socket.on('mensajeEliminado', (data: { mensajeId: number }) => {
      const msg = this.mensajes.find(m => m.id === data.mensajeId);
      if (msg) { msg.eliminado = true; msg.contenido = '🚫 Mensaje eliminado'; }
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

  // FIX: admin puede eliminar cualquier mensaje, autor solo el suyo
  puedeEliminar(mensaje: Mensaje): boolean {
    return mensaje.usuarioId === this.usuarioActual.id || this.esAdmin;
  }

  // ── Ver quiénes leyeron ───────────────────────────────────────────────────
  verLecturas(mensaje: Mensaje): void {
    if (!mensaje.id || !this.esMio(mensaje)) return;
    this.mensajeLecturas = mensaje;
    this.lecturasDetalle = [];
    this.cargandoLecturas = true;
    this.mostrarLecturas = true;

    this.http.get<LecturaDetalle[]>(
      `${environment.url_ms_business}/mensajes/${mensaje.id}/lecturas`,
      { headers: { Authorization: this.token } }
    ).subscribe({
      next: lecturas => { this.lecturasDetalle = lecturas; this.cargandoLecturas = false; },
      error: () => { this.cargandoLecturas = false; },
    });
  }

  cerrarLecturas(): void {
    this.mostrarLecturas = false;
    this.mensajeLecturas = undefined;
    this.lecturasDetalle = [];
  }

  // ── Reenvío ───────────────────────────────────────────────────────────────
  abrirReenvio(mensaje: Mensaje): void {
    if (mensaje.eliminado) return;
    this.mensajeSeleccionado = mensaje;
    this.gruposSeleccionados = new Set();
    this.mostrarModalReenvio = true;
  }

  cerrarReenvio(): void {
    this.mostrarModalReenvio = false;
    this.mensajeSeleccionado = undefined;
    this.gruposSeleccionados = new Set();
  }

  toggleGrupoDestino(grupoId: number): void {
    if (this.gruposSeleccionados.has(grupoId)) {
      this.gruposSeleccionados.delete(grupoId);
    } else {
      this.gruposSeleccionados.add(grupoId);
    }
  }

  reenviar(): void {
    if (!this.mensajeSeleccionado || this.gruposSeleccionados.size === 0 || this.reenviando) return;
    this.reenviando = true;
    const { id, nombre } = this.usuarioActual;
    const contenido = `↩ ${this.mensajeSeleccionado.contenido}`;
    for (const grupoId of Array.from(this.gruposSeleccionados)) {
      this.socket.emit('enviarMensaje', { grupoId, usuarioId: id, nombreUsuario: nombre, contenido });
    }
    this.reenviando = false;
    this.cerrarReenvio();
  }

  gruposParaReenvio(): (Grupo & { rol?: string })[] {
    return this.misGrupos.filter(g => g.id !== this.grupoId);
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
