import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

export interface NotificacionMensaje {
  id: string;
  emisorId: string;
  emisorNombre: string;
  mensaje: string;
  fecha: Date;
  leido: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ChatNotificationService {
  private socket: Socket | null = null;
  private notificaciones: NotificacionMensaje[] = [];
  private notificacionSubject = new Subject<NotificacionMensaje[]>();
  private audioContext: AudioContext | null = null;
  private sonidoHabilitado = false;

  constructor() {
    this.inicializarAudio();
    this.cargarNotificaciones();
  }

  private inicializarAudio(): void {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  private cargarNotificaciones(): void {
    const guardadas = localStorage.getItem('notificaciones_mensajes');
    if (guardadas) {
      this.notificaciones = JSON.parse(guardadas);
    }
  }

  private guardarNotificaciones(): void {
    localStorage.setItem('notificaciones_mensajes', JSON.stringify(this.notificaciones));
  }

  conectar(usuarioId: string): void {
    if (this.socket?.connected) return;

    this.socket = io('http://localhost:3001/api/notificaciones', {
      query: { usuarioId },
      transports: ['websocket']
    });

    this.socket.on('connect', () => {
      console.log('✅ Campanita conectada');
    });

    this.socket.on('nueva_notificacion', (data: any) => {
      console.log('🔔 Notificación recibida del backend:', data);

      const existe = this.notificaciones.find(n => n.emisorId === data.emisorId);

      if (existe) {
        existe.mensaje = data.mensaje;
        existe.fecha = new Date();
        existe.leido = false;
      } else {
        const nuevaNotif: NotificacionMensaje = {
          id: Date.now().toString(),
          emisorId: data.emisorId,
          emisorNombre: data.emisorNombre,
          mensaje: data.mensaje,
          fecha: new Date(),
          leido: false
        };
        this.notificaciones.unshift(nuevaNotif);
      }

      this.guardarNotificaciones();
      this.notificacionSubject.next(this.notificaciones);
      this.reproducirSonido();
    });
  }

  desconectar(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // 👈 NUEVO MÉTODO AGREGADO
  enviarNotificacionMensaje(
    destinatarioId: string,
    emisorId: string,
    emisorNombre: string,
    mensaje: string
  ): void {
    if (!this.socket) {
      console.log('⚠️ No hay conexión a notificaciones');
      return;
    }

    console.log('📤 Enviando notificación a:', destinatarioId);

    this.socket.emit('enviar_notificacion', {
      usuarioId: destinatarioId,
      emisorId: emisorId,
      emisorNombre: emisorNombre,
      mensaje: mensaje.substring(0, 100)
    });
  }

  obtenerNotificaciones(): NotificacionMensaje[] {
    return this.notificaciones;
  }

  obtenerNoLeidos(): number {
    return this.notificaciones.filter(n => !n.leido).length;
  }

  marcarComoLeido(emisorId: string): void {
    const notif = this.notificaciones.find(n => n.emisorId === emisorId);
    if (notif) {
      notif.leido = true;
      this.guardarNotificaciones();
      this.notificacionSubject.next(this.notificaciones);
    }
  }

  marcarTodosLeidos(): void {
    this.notificaciones.forEach(n => n.leido = true);
    this.guardarNotificaciones();
    this.notificacionSubject.next(this.notificaciones);
  }

  habilitarSonido(): void {
    if (this.audioContext && !this.sonidoHabilitado) {
      this.audioContext.resume().then(() => {
        this.sonidoHabilitado = true;
        console.log('🔊 Sonido habilitado');
      });
    }
  }

  private reproducirSonido(): void {
    if (!this.sonidoHabilitado || !this.audioContext) return;
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      oscillator.frequency.value = 880;
      gainNode.gain.value = 0.15;
      oscillator.start();
      gainNode.gain.exponentialRampToValueAtTime(0.00001, this.audioContext.currentTime + 0.3);
      oscillator.stop(this.audioContext.currentTime + 0.3);
    } catch(e) {
      console.log('Error con sonido:', e);
    }
  }

  onNotificaciones(): Observable<NotificacionMensaje[]> {
    return this.notificacionSubject.asObservable();
  }
}
