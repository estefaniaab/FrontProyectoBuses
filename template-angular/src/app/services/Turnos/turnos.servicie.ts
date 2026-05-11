import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Turno } from '../../models/Turnos/turnos.model';
import { Bus } from '../../models/Buses/bus.model';

@Injectable({
  providedIn: 'root'
})
export class TurnosService {
  private url = `${environment.url_ms_business}/turnos`;

  constructor(private http: HttpClient) {}

  /**
   * Devuelve conductores con su nombre cruzado desde el MS de seguridad.
   * Mismo patrón que ConductoresService con forkJoin.
   */
  getConductores(): Observable<any[]> {
    return forkJoin({
      conductores: this.http.get<any[]>(`${environment.url_ms_business}/conductores`),
      users:       this.http.get<any[]>(`${environment.url_ms_security}/users`)
    }).pipe(
      map(({ conductores, users }) =>
        conductores.map(conductor => {
          const user = users.find(u => String(u.id) === String(conductor.userId));
          return { ...conductor, user };
        })
      )
    );
  }

  getBuses(): Observable<Bus[]> {
    return this.http.get<Bus[]>(`${environment.url_ms_business}/buses`);
  }

  findAll(estadoTurno?: string): Observable<Turno[]> {
    const params = estadoTurno ? `?estadoTurno=${estadoTurno}` : '';
    return this.http.get<Turno[]>(`${this.url}${params}`);
  }

  view(id: number): Observable<Turno> {
    return this.http.get<Turno>(`${this.url}/${id}`);
  }

  create(newTurno: Partial<Turno>): Observable<Turno> {
    return this.http.post<Turno>(this.url, newTurno);
  }

  update(id: number, theTurno: Partial<Turno>): Observable<Turno> {
    return this.http.patch<Turno>(`${this.url}/${id}`, theTurno);
  }

  iniciarTurno(id: number, datos: { estadoBus: string; observaciones?: string }): Observable<Turno> {
    return this.http.post<Turno>(`${this.url}/${id}/iniciar`, datos);
  }

  finalizarTurno(id: number): Observable<Turno> {
    return this.http.post<Turno>(`${this.url}/${id}/finalizar`, {});
  }

  remove(id: number): Observable<any> {
    return this.http.delete<any>(`${this.url}/${id}`);
  }
}
