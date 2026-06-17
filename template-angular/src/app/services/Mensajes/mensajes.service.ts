import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { Mensaje } from 'src/app/models/Mensaje/mensaje.model';
import { ChatNotificationService } from '../Chat-Notification/chat-notification.service'; // 👈 Importar

@Injectable({
  providedIn: 'root'
})
export class MensajesService {

  private url = environment.url_ms_business;
  private socket!: Socket;

  constructor(
    private http: HttpClient,
    private chatNotificationService: ChatNotificationService
  ) {}

  // ── WebSocket ─────────────────────────────────────────────────────────────

  conectar(userId: string): void {

    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io('http://localhost:3000/api/mensajes', {
      query: { usuarioId: userId },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('SOCKET CONECTADO');
    });

    this.socket.onAny((event, ...args) => {
      console.log('EVENTO:', event, args);
    });
  }

  desconectar(): void {
    if (this.socket) this.socket.disconnect();
  }

  /**
   * Emite el evento "enviar_mensaje" con la forma que espera el Gateway:
   * { emisorUsuarioId, dto: { destinatarioUsuarioId, contenido, latitud?, longitud? } }
   */
  enviarMensaje(
    emisorUsuarioId: string,
    destinatarioUsuarioId: string,
    contenido: string,
    latitud?: number,
    longitud?: number,
  ): void {
    console.log('CONNECTED?', this.socket.connected);

    this.socket.emit('enviar_mensaje', {
      emisorUsuarioId,
      dto: { destinatarioUsuarioId, contenido, latitud, longitud },
    });
  }

  onMensajeEnviado(): Observable<Mensaje> {
    return new Observable(observer => {
      const handler = (msg: Mensaje) => observer.next(msg);
      this.socket.on('mensaje_enviado', handler);
      return () => this.socket.off('mensaje_enviado', handler);
    });
  }

  onMensajeRecibido(): Observable<Mensaje> {
    return new Observable(observer => {
      const handler = (msg: Mensaje) => observer.next(msg);
      this.socket.on('mensaje_recibido', handler);
      return () => this.socket.off('mensaje_recibido', handler);
    });
  }

  onMensajeLeido(): Observable<{ mensajeId: number; fechaLeido: Date }> {
    return new Observable(observer => {
      const handler = (data: any) => observer.next(data);
      this.socket.on('mensaje_leido', handler);
      return () => this.socket.off('mensaje_leido', handler);
    });
  }

  marcarLeido(mensajeId: number, userId: string): void {
    this.socket.emit('marcar_leido', { mensajeId, usuarioId: userId });
  }

  // ── HTTP ──────────────────────────────────────────────────────────────────

  getConversacion(userId: string, otroUserId: string): Observable<Mensaje[]> {
    return new Observable(observer => {
      let enviados: Mensaje[] = [];
      let recibidos: Mensaje[] = [];
      let pendientes = 2;

      const combinar = () => {
        if (--pendientes > 0) return;

        const enviadosAlOtro = enviados.filter(m =>
          m.destinatariosPersona?.some(d => d.usuarioId === otroUserId)
        );

        const recibidosDelOtro = recibidos.filter(m => m.emisorId === otroUserId);

        const todos = [...enviadosAlOtro, ...recibidosDelOtro]
          .sort((a, b) => new Date(a.fechaEnvio).getTime() - new Date(b.fechaEnvio).getTime());

        observer.next(todos);
        observer.complete();
      };

      this.getEnviados(userId).subscribe({ next: d => { enviados = d; combinar(); }, error: () => { enviados = []; combinar(); } });
      this.getRecibidos(userId).subscribe({ next: d => { recibidos = d; combinar(); }, error: () => { recibidos = []; combinar(); } });
    });
  }

  getEnviados(emisorId: string): Observable<Mensaje[]> {
    return this.http.get<Mensaje[]>(
      `${this.url}/mensajes/enviados/${emisorId}`
    );
  }

  getRecibidos(destinatarioId: string): Observable<Mensaje[]> {
    return this.http.get<Mensaje[]>(
      `${this.url}/mensajes/recibidos/${destinatarioId}`
    );
  }

  getNoLeidos(destinatarioId: string): Observable<number> {
    return this.http.get<number>(
      `${this.url}/mensajes/no-leidos/${destinatarioId}`
    );
  }

  buscarUsuarios(query: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${environment.url_ms_security}/users/search?query=${query}`
    );
  }

  getUserById(id: string): Observable<any> {
    const session = JSON.parse(localStorage.getItem('session') || '{}');
    return this.http.get<any>(
      `${environment.url_ms_security}/users/${id}`,
      { headers: { Authorization: `Bearer ${session.token}` } }
    );
  }

  getFotoPerfil(userId: string): Observable<{ photo: string }> {
    const session = JSON.parse(localStorage.getItem('session') || '{}');
    return this.http.get<{ photo: string }>(
      `${environment.url_ms_security}/profiles/by-user/${userId}`,
      { headers: { Authorization: `Bearer ${session.token}` } }
    );
  }

  // Enviar notificación al destinatario
  enviarNotificacionMensaje(destinatarioId: string, emisorId: string, emisorNombre: string, mensaje: string): void {
    this.chatNotificationService.enviarNotificacionMensaje(destinatarioId, emisorId, emisorNombre, mensaje);
  }
}
