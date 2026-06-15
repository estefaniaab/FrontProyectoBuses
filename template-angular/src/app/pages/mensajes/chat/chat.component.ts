import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { MensajesService } from 'src/app/services/Mensajes/mensajes.service';
import { SecurityService } from 'src/app/services/security.service';
import { Mensaje } from 'src/app/models/Mensaje/mensaje.model';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  usuarioActual: any = null;
  destinatarioId = '';
  destinatarioNombre = '';
  mensajes: Mensaje[] = [];
  nuevoMensaje = '';
  adjuntarUbicacion = false;
  miLatitud: number | null = null;
  miLongitud: number | null = null;
  enviando = false;
  destinatarioFoto: string | null = null;

  private subs: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private mensajesService: MensajesService,
    private securityService: SecurityService,
  ) {}

  ngOnInit(): void {
    this.usuarioActual = this.securityService.activeUserSession;
    this.destinatarioId = this.route.snapshot.paramMap.get('userId') || '';

    if (!this.usuarioActual?.id || !this.destinatarioId) return;

    this.mensajesService.conectar(this.usuarioActual.id);
    this.cargarConversacion();
    this.obtenerUbicacion();
    this.cargarNombreDestinatario();

    // Escuchar mensajes en tiempo real
    this.subs.push(
      this.mensajesService.onMensajeRecibido().subscribe((msg) => {
        if (
          (msg.emisorId === this.destinatarioId && msg.destinatarioId === this.usuarioActual.id) ||
          (msg.emisorId === this.usuarioActual.id && msg.destinatarioId === this.destinatarioId)
        ) {
          this.mensajes.push(msg);
          // Marcar como leído si soy el destinatario
          if (msg.destinatarioId === this.usuarioActual.id) {
            this.mensajesService.marcarLeido(msg.id, this.usuarioActual.id);
          }
        }
      })
    );

    this.subs.push(
      this.mensajesService.onMensajeEnviado().subscribe((msg) => {
        // Actualizar el mensaje en la lista con el id asignado por el backend
        const idx = this.mensajes.findIndex(m => m.contenido === msg.contenido && !m.id);
        if (idx >= 0) {
          this.mensajes[idx] = msg;
        }
      })
    );

    this.subs.push(
      this.mensajesService.onMensajeLeido().subscribe((data) => {
        const msg = this.mensajes.find(m => m.id === data.mensajeId);
        if (msg) {
          msg.leido = true;
          msg.fechaLeido = data.fechaLeido;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  ngAfterViewChecked(): void {
    this.scrollAlFinal();
  }

  cargarConversacion(): void {
    this.mensajesService
      .getConversacion(this.usuarioActual.id, this.destinatarioId)
      .subscribe(msgs => {
        this.mensajes = msgs;
        // Marcar como leídos los mensajes recibidos
        msgs.forEach(msg => {
          if (msg.destinatarioId === this.usuarioActual.id && !msg.leido) {
            this.mensajesService.marcarLeido(msg.id, this.usuarioActual.id);
          }
        });
      });
  }

  cargarNombreDestinatario(): void {
    this.mensajesService.getUserById(this.destinatarioId).subscribe({
      next: (user) => this.destinatarioNombre = user?.name || this.destinatarioId,
      error: () => this.destinatarioNombre = this.destinatarioId,
    });

    this.mensajesService.getFotoPerfil(this.destinatarioId).subscribe({
      next: (res) => this.destinatarioFoto = res?.photo || null,
      error: () => this.destinatarioFoto = null,
    });
  }

  obtenerUbicacion(): void {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      this.miLatitud = pos.coords.latitude;
      this.miLongitud = pos.coords.longitude;
    });
  }

  enviar(): void {
    if (!this.nuevoMensaje.trim() || this.enviando) return;
    if (this.nuevoMensaje.length > 500) return;

    this.enviando = true;

    const latitud = this.adjuntarUbicacion ? this.miLatitud ?? undefined : undefined;
    const longitud = this.adjuntarUbicacion ? this.miLongitud ?? undefined : undefined;

    // Agregar optimistamente a la lista
    const msgTemporal: any = {
      id: null,
      emisorId: this.usuarioActual.id,
      destinatarioId: this.destinatarioId,
      contenido: this.nuevoMensaje,
      leido: false,
      fechaLeido: null,
      latitud: latitud ?? null,
      longitud: longitud ?? null,
      fechaEnvio: new Date(),
    };
    this.mensajes.push(msgTemporal);

    this.mensajesService.enviarMensaje(
      this.usuarioActual.id,
      this.destinatarioId,
      this.nuevoMensaje,
      latitud,
      longitud,
    );

    this.nuevoMensaje = '';
    this.adjuntarUbicacion = false;
    this.enviando = false;
  }

  scrollAlFinal(): void {
    try {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop =
          this.scrollContainer.nativeElement.scrollHeight;
      }
    } catch {}
  }

  esMio(msg: Mensaje): boolean {
    return msg.emisorId === this.usuarioActual?.id;
  }

  abrirMapa(lat: number, lng: number): void {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
  }
}
