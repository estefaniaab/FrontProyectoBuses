import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Incidente, StatsIncidente } from '../../models/Incidentes/incidente.model';

@Injectable({ providedIn: 'root' })
export class IncidentesService {
  private url = `${environment.url_ms_business}/incidentes`;

  constructor(private http: HttpClient) {}

  reportar(dto: {
    tipo: string;
    gravedad: string;
    descripcion?: string;
    busId: number;
    conductorId?: number;
    turnoId?: number;
    fotos?: { urlFoto: string; descripcion?: string }[];
  }): Observable<Incidente> {
    return this.http.post<Incidente>(`${this.url}/reportar`, dto, { observe: 'body' });
  }

  findByBus(busId: number, tipo?: string, estado?: string): Observable<Incidente[]> {
    let params = '';
    if (tipo)   params += `?tipo=${tipo}`;
    if (estado) params += `${params ? '&' : '?'}estado=${estado}`;
    return this.http.get<Incidente[]>(`${this.url}/bus/${busId}${params}`, { observe: 'body' });
  }

  getStatsByBus(busId: number): Observable<StatsIncidente> {
    return this.http.get<StatsIncidente>(`${this.url}/bus/${busId}/stats`, { observe: 'body' });
  }

  findOne(id: number): Observable<Incidente> {
    return this.http.get<Incidente>(`${this.url}/${id}`, { observe: 'body' });
  }

  update(id: number, dto: { estado?: string; comentario?: string }): Observable<Incidente> {
    return this.http.patch<Incidente>(`${this.url}/${id}`, dto, { observe: 'body' });
  }

  getConductorByUsuarioId(userId: string): Observable<any> {
    return this.http.get<any>(
      `${environment.url_ms_business}/conductores/by-usuario/${userId}`,
      { observe: 'body' }
    );
  }
}
