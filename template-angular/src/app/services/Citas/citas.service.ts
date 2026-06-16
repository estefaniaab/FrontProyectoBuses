import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';

import { Cita } from 'src/app/models/Citas/cita.model';

@Injectable({
  providedIn: 'root'
})
export class CitasService {

  constructor(
    private http: HttpClient
  ) {}

  getDisponibilidad(
    cita: Cita
  ): Observable<any> {

    return this.http.post<any>(

      `${environment.url_ms_business}/citas/disponibilidad`,

      cita

    );

  }

  agendar(
    cita: Cita
  ): Observable<any> {

    return this.http.post<any>(

      `${environment.url_ms_business}/citas/agendar`,

      cita

    );

  }

  misCitas(): Observable<Cita[]> {

    return this.http.get<Cita[]>(

      `${environment.url_ms_business}/citas/mis-citas`

    );

  }

  cancelar(
    token: string
  ): Observable<any> {

    return this.http.get<any>(

      `${environment.url_ms_business}/citas/cancelar-publica/${token}`

    );

  }

}
