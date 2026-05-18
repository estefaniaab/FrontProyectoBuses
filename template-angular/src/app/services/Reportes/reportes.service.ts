import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {

  private url = `${environment.url_ms_business}/reportes`;

  constructor(private http: HttpClient) {}

  getRangosEtarios(filtros: {
    rutaId?: number;
    fechaInicio?: string;
    fechaFin?: string;
  }): Observable<any> {
    let params = new HttpParams();

    if (filtros.rutaId) {
      params = params.set('rutaId', filtros.rutaId);
    }

    if (filtros.fechaInicio) {
      params = params.set('fechaInicio', filtros.fechaInicio);
    }

    if (filtros.fechaFin) {
      params = params.set('fechaFin', filtros.fechaFin);
    }

    return this.http.get<any>(
      `${this.url}/rangos-etarios`,
      { params }
    );
  }
}
