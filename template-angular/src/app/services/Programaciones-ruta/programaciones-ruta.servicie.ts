import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProgramacionRuta } from '../../models/Programaciones-ruta/programacion-ruta.model';
import { Bus } from '../../models/Buses/bus.model';

export interface Ruta {
  id?: number;
  nombre?: string;
  descripcion?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProgramacionesRutaService {
  private url = `${environment.url_ms_business}/programaciones-ruta`;

  constructor(private http: HttpClient) {}

  getRutas(): Observable<Ruta[]> {
    return this.http.get<Ruta[]>(`${environment.url_ms_business}/rutas`);
  }

  getBuses(): Observable<Bus[]> {
    return this.http.get<Bus[]>(`${environment.url_ms_business}/buses`);
  }

  findAll(estado?: string): Observable<ProgramacionRuta[]> {
    const params = estado ? `?estado=${estado}` : '';
    return this.http.get<ProgramacionRuta[]>(`${this.url}${params}`);
  }

  view(id: number): Observable<ProgramacionRuta> {
    return this.http.get<ProgramacionRuta>(`${this.url}/${id}`);
  }

  create(dto: Partial<ProgramacionRuta>): Observable<ProgramacionRuta> {
    return this.http.post<ProgramacionRuta>(this.url, dto);
  }

  update(id: number, dto: Partial<ProgramacionRuta>): Observable<ProgramacionRuta> {
    return this.http.patch<ProgramacionRuta>(`${this.url}/${id}`, dto);
  }

  cancelar(id: number): Observable<ProgramacionRuta> {
    return this.http.post<ProgramacionRuta>(`${this.url}/${id}/cancelar`, {});
  }

  remove(id: number): Observable<any> {
    return this.http.delete<any>(`${this.url}/${id}`);
  }
}
