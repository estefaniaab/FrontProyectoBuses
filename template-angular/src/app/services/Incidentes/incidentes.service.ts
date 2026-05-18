import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { Incidente, StatsIncidente } from '../../models/Incidentes/incidente.model';

@Injectable({providedIn: 'root'})
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
    return this.http.post<Incidente>(
      `${this.url}/reportar`,
      dto
    );
  }

  findByBus(
    busId: number,
    tipo?: string,
    estado?: string
  ): Observable<Incidente[]> {
    let params = new HttpParams();

    if (tipo) {
      params = params.set('tipo', tipo);
    }

    if (estado) {
      params = params.set('estado', estado);
    }

    return this.http.get<Incidente[]>(
      `${this.url}/bus/${busId}`,
      { params }
    );
  }

  getStatsByBus(busId: number): Observable<StatsIncidente> {
    return this.http.get<StatsIncidente>(
      `${this.url}/bus/${busId}/stats`
    );
  }

  findOne(id: number): Observable<Incidente> {
    return this.http.get<Incidente>(
      `${this.url}/${id}`
    );
  }

  update(
    id: number,
    dto: { estado?: string; comentario?: string }
  ): Observable<Incidente> {
    return this.http.patch<Incidente>(
      `${this.url}/${id}`,
      dto
    );
  }

  getConductorByUsuarioId(userId: string): Observable<any> {
    return this.http.get<any>(
      `${environment.url_ms_business}/conductores/by-usuario/${userId}`
    );
  }
}
