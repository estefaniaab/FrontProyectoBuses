import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MonitoreoService {

  constructor(private http: HttpClient) { }

  obtenerActivos(): Observable<any[]> {
    return this.http.get<any[]>(
      `${environment.url_ms_business}/monitoreo/activos`
    );
  }

  obtenerActivosPorRuta(
    rutaId: number
  ): Observable<any[]> {

    return this.http.get<any[]>(
      `${environment.url_ms_business}/monitoreo/ruta/${rutaId}/activos`
    );
  }

  calcularEta(
    busId: number,
    paraderoId: number
  ): Observable<any> {

    return this.http.get<any>(
      `${environment.url_ms_business}/monitoreo/bus/${busId}/eta/${paraderoId}`
    );
  }

}
