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

    this.subs.push(
      this.mensajesService.onMensajeRecibido().subscribe(() => this.cargarBandeja())
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
      // Para enviados mostramos el último mensaje por destinatario
      this.enviados = data;
    });

    this.mensajesService.getNoLeidos(id).subscribe(n => {
      this.noLeidos = n;
    });
  }

  /** Agrupa recibidos: queda solo el último mensaje por emisor */
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

  /** Agrupa enviados: queda solo el último mensaje por destinatario */
  private agruparPorDestinatario(mensajes: Mensaje[]): Mensaje[] {
    const porUsuario = new Map<string, Mensaje>();
    for (const msg of mensajes) {
      const destId = msg.destinatariosPersona?.find(d => d.usuarioId !== this.usuarioActual.id)?.usuarioId;
      if (!destId) continue;
      const existente = porUsuario.get(destId);
      if (!existente || new Date(msg.fechaEnvio) > new Date(existente.fechaEnvio)) {
        porUsuario.set(destId, msg);
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

  // ── Helpers de estado leído para la vista ────────────────────────────────

  /** ¿El mensaje recibido fue leído por mí? */
  estaLeido(msg: Mensaje): boolean {
    return msg.destinatariosPersona?.some(
      d => d.usuarioId === this.usuarioActual.id && d.leido
    ) ?? false;
  }

  /** Fecha en que yo leí ese mensaje */
  getFechaLeido(msg: Mensaje): Date | null {
    return msg.destinatariosPersona?.find(
      d => d.usuarioId === this.usuarioActual.id
    )?.fechaLeido ?? null;
  }

  /** ¿El enviado fue leído por el destinatario? */
  fueLeido(msg: Mensaje): boolean {
    return (msg.destinatariosPersona ?? []).some(
      d => d.leido === true
    );
  }

  // ── Cache de nombres y fotos ──────────────────────────────────────────────

  usuariosCache: Map<string, any> = new Map();
  private usuariosSolicitados: Set<string> = new Set();

  cargarNombreUsuario(id: string): void {
    if (this.usuariosCache.has(id) || this.usuariosSolicitados.has(id)) return;
    this.usuariosSolicitados.add(id);

    this.mensajesService.getUserById(id).subscribe({
      next: (user) => {
        const existente = this.usuariosCache.get(id) || {};
        this.usuariosCache.set(id, { ...existente, name: user?.name || id });
      },
      error: () => {
        const existente = this.usuariosCache.get(id) || {};
        this.usuariosCache.set(id, { ...existente, name: id });
      }
    });

    this.mensajesService.getFotoPerfil(id).subscribe({
      next: (res) => {
        const existente = this.usuariosCache.get(id) || {};
        this.usuariosCache.set(id, { ...existente, photo: res?.photo || null });
      },
      error: () => {
        const existente = this.usuariosCache.get(id) || {};
        this.usuariosCache.set(id, { ...existente, photo: null });
      }
    });
  }

  getNombreUsuario(id: string): string {
    if (!id) return '';
    this.cargarNombreUsuario(id);
    return this.usuariosCache.get(id)?.name || id;
  }

  getFotoUsuario(id: string): string | null {
    if (!id) return null;
    this.cargarNombreUsuario(id);
    return this.usuariosCache.get(id)?.photo || null;
  }

  getDestinatarioId(mensaje: Mensaje): string | null {
    // Si el mensaje ya tiene un campo destinatarioId (podrías agregarlo después)
    if ((mensaje as any).destinatarioId) {
      return (mensaje as any).destinatarioId;
    }

    // Si no, lo extrae de destinatariosPersona
    if (mensaje.destinatariosPersona && mensaje.destinatariosPersona.length > 0) {
      // Para mensajes enviados, el destinatario es el que NO es el usuario actual
      const destinatario = mensaje.destinatariosPersona.find(
        d => d.usuarioId !== this.usuarioActual?.id
      );
      return destinatario?.usuarioId || mensaje.destinatariosPersona[0]?.usuarioId || null;
    }

    return null;
  }
}
