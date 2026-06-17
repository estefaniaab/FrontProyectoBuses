import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {

  private url = environment.url_ms_notifications;

  constructor(private http: HttpClient) {}

  suscribirse(data: {
    ciudadanoId: number;
    rutaId: number;
    paraderoId: number;
    fcmToken: string;
    minutosAnticipacion: number;
  }): Observable<any> {
    return this.http.post(`${this.url}/suscripciones`, data);
  }

  cancelarSuscripcion(id: number): Observable<any> {
    return this.http.delete(`${this.url}/suscripciones/${id}`);
  }

  misSuscripciones(ciudadanoId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.url}/suscripciones/ciudadano/${ciudadanoId}`
    );
  }
}
