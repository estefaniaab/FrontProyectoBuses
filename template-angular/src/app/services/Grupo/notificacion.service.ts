import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Notificacion } from '../../models/Grupos/grupo.model';

@Injectable({ providedIn: 'root' })
export class NotificacionService {
  private base = `${environment.url_ms_notifications}/notificaciones`;

  constructor(private http: HttpClient) {}

  listarPorUsuario(usuarioId: string): Observable<Notificacion[]> {
    return this.http.get<Notificacion[]>(`${this.base}/usuario/${usuarioId}`);
  }

  contarNoLeidas(usuarioId: string): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.base}/usuario/${usuarioId}/no-leidas`);
  }

  marcarLeida(id: number): Observable<Notificacion> {
    return this.http.patch<Notificacion>(`${this.base}/${id}/leer`, {});
  }

  marcarTodasLeidas(usuarioId: string): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.base}/usuario/${usuarioId}/leer-todas`, {});
  }
}
