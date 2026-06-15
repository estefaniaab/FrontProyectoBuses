import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { Mensaje } from 'src/app/models/Mensaje/mensaje.model';

@Injectable({
  providedIn: 'root'
})
export class MensajesService {

  private url = environment.url_ms_notifications;
  private socket!: Socket;

  constructor(private http: HttpClient) {}

  // ── WebSocket ─────────────────────────────────────────────────────────────

  conectar(userId: string): void {
    if (this.socket?.connected) {
      this.socket.disconnect();
    }
    this.socket = io(`${this.url}/mensajes`, {
      query: { userId },
      transports: ['websocket'],
    });
  }

  desconectar(): void {
    if (this.socket) this.socket.disconnect();
  }

  enviarMensaje(emisorId: string, destinatarioId: string, contenido: string, latitud?: number, longitud?: number): void {
    this.socket.emit('enviar_mensaje', {
      emisorId,
      dto: { destinatarioId, contenido, latitud, longitud }
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
    this.socket.emit('marcar_leido', { mensajeId, userId });
  }

  // ── HTTP ──────────────────────────────────────────────────────────────────

  getConversacion(userId1: string, userId2: string): Observable<Mensaje[]> {
    return this.http.get<Mensaje[]>(
      `${this.url}/mensajes/conversacion/${userId1}/${userId2}`
    );
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
}
