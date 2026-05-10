import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MetodoPagoCiudadano } from 'src/app/models/MetodosPagoCiudadano/metodo-pago-ciudadano.model';

@Injectable({
  providedIn: 'root'
})
export class MetodoPagoCiudadanoService {

  constructor(private http: HttpClient) {}

  findActivosByCiudadano(ciudadanoId: number): Observable<MetodoPagoCiudadano[]> {
    return this.http.get<MetodoPagoCiudadano[]>(
      `${environment.url_ms_business}/metodos-pago-ciudadano/ciudadano/${ciudadanoId}/activos`
    );
  }

  findRecargablesByCiudadano(ciudadanoId: number): Observable<MetodoPagoCiudadano[]> {
    return this.http.get<MetodoPagoCiudadano[]>(
      `${environment.url_ms_business}/metodos-pago-ciudadano/ciudadano/${ciudadanoId}/recargables`
    );
  }

  view(id: number): Observable<MetodoPagoCiudadano> {
    return this.http.get<MetodoPagoCiudadano>(
      `${environment.url_ms_business}/metodos-pago-ciudadano/${id}`
    );
  }
}
