import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { Gps } from 'src/app/models/Gps/gps.model';

@Injectable({
  providedIn: 'root'
})
export class GpsService {

  private url = `${environment.url_ms_business}/gps`;

  constructor(private http: HttpClient) {}

  findByBus(busId: number): Observable<Gps> {
    return this.http.get<Gps>(`${this.url}/bus/${busId}`);
  }

  create(gps: Gps): Observable<Gps> {
    return this.http.post<Gps>(this.url, gps);
  }

  update(id: number, gps: Gps): Observable<Gps> {
    return this.http.patch<Gps>(`${this.url}/${id}`, gps);
  }

  activarGps(busId: number): Observable<Gps> {
    return this.http.patch<Gps>(
      `${this.url}/bus/${busId}/activar`,
      {}
    );
  }

  desactivarGps(busId: number): Observable<Gps> {
    return this.http.patch<Gps>(
      `${this.url}/bus/${busId}/desactivar`,
      {}
    );
  }

  simularMovimiento(busId: number): Observable<Gps> {
    return this.http.post<Gps>(
      `${this.url}/bus/${busId}/simular`,
      {}
    );
  }
}
