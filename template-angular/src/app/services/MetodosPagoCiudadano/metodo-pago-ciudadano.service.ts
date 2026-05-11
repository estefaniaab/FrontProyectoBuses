import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MetodoPagoCiudadano } from 'src/app/models/MetodosPagoCiudadano/metodo-pago-ciudadano.model';

@Injectable({
  providedIn: 'root'
})
export class MetodoPagoCiudadanoService {

  constructor(private http: HttpClient) {}

  list(): Observable<MetodoPagoCiudadano[]> {
    return this.http.get<MetodoPagoCiudadano[]>(
      `${environment.url_ms_business}/metodos-pago-ciudadano`
    );
  }

  view(id: number): Observable<MetodoPagoCiudadano> {
    return this.http.get<MetodoPagoCiudadano>(
      `${environment.url_ms_business}/metodos-pago-ciudadano/${id}`
    );
  }

  create(data: any): Observable<MetodoPagoCiudadano> {
    return this.http.post<MetodoPagoCiudadano>(
      `${environment.url_ms_business}/metodos-pago-ciudadano`,
      data
    );
  }

  update(id: number, data: any): Observable<MetodoPagoCiudadano> {
    return this.http.patch<MetodoPagoCiudadano>(
      `${environment.url_ms_business}/metodos-pago-ciudadano/${id}`,
      data
    );
  }

  delete(id: number): Observable<any> {
    return this.http.delete(
      `${environment.url_ms_business}/metodos-pago-ciudadano/${id}`
    );
  }

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
}
