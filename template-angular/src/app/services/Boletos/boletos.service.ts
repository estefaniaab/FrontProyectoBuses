import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  Boleto, AbordajeResponse, DescensoResponse,
  MetodoPagoCiudadanoBasic, ParaderoBasic,
} from '../../models/Boletos/boleto.model';
import { ProgramacionRuta } from '../../models/Programaciones-ruta/programacion-ruta.model';

export interface CiudadanoBasic {
  id: number;
  usuarioId: string;
}

@Injectable({ providedIn: 'root' })
export class BoletosService {
  private url = `${environment.url_ms_business}/boletos`;

  constructor(private http: HttpClient) {}

  abordar(dto: {
    ciudadanoId: number;
    programacionRutaId: number;
    metodoPagoCiudadanoId: number;
    paraderoAbordajeId: number;
  }): Observable<AbordajeResponse> {
    return this.http.post<AbordajeResponse>(`${this.url}/abordar`, dto, { observe: 'body' });
  }

  descender(id: number, dto: { paraderoDescensoId: number }): Observable<DescensoResponse> {
    return this.http.post<DescensoResponse>(`${this.url}/${id}/descender`, dto, { observe: 'body' });
  }

  findAll(): Observable<Boleto[]> {
    return this.http.get<Boleto[]>(this.url, { observe: 'body' });
  }

  findOne(id: number): Observable<Boleto> {
    return this.http.get<Boleto>(`${this.url}/${id}`, { observe: 'body' });
  }

  findByCiudadano(ciudadanoId: number): Observable<Boleto[]> {
    return this.http.get<Boleto[]>(`${this.url}/ciudadano/${ciudadanoId}`, { observe: 'body' });
  }

  getCiudadanoByUsuarioId(usuarioId: string): Observable<CiudadanoBasic> {
    return this.http.get<CiudadanoBasic>(
      `${environment.url_ms_business}/ciudadanos/usuario/${usuarioId}`,
      { observe: 'body' }
    );
  }

  getProgramacionesEnCurso(): Observable<ProgramacionRuta[]> {
    return this.http.get<ProgramacionRuta[]>(
      `${environment.url_ms_business}/programaciones-ruta?estado=en_curso`,
      { observe: 'body' }
    );
  }

  getParaderos(): Observable<ParaderoBasic[]> {
    return this.http.get<ParaderoBasic[]>(
      `${environment.url_ms_business}/paraderos`,
      { observe: 'body' }
    );
  }

  getMetodosPagoByCiudadano(ciudadanoId: number): Observable<MetodoPagoCiudadanoBasic[]> {
    return this.http.get<MetodoPagoCiudadanoBasic[]>(
      `${environment.url_ms_business}/metodos-pago-ciudadano/ciudadano/${ciudadanoId}/activos`,
      { observe: 'body' }
    );
  }
}
