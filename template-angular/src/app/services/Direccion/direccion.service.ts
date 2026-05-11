import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Direccion } from 'src/app/models/Direcciones/direccion.model';

@Injectable({
  providedIn: 'root'
})
export class DireccionService {

  constructor(private http: HttpClient) {}

  list(): Observable<Direccion[]> {
    return this.http.get<Direccion[]>(
      `${environment.url_ms_business}/direcciones`
    );
  }

  view(id: number): Observable<Direccion> {
    return this.http.get<Direccion>(
      `${environment.url_ms_business}/direcciones/${id}`
    );
  }

  create(data: any): Observable<Direccion> {
    return this.http.post<Direccion>(
      `${environment.url_ms_business}/direcciones`,
      data
    );
  }

  update(id: number, data: any): Observable<Direccion> {
    return this.http.patch<Direccion>(
      `${environment.url_ms_business}/direcciones/${id}`,
      data
    );
  }

  delete(id: number): Observable<any> {
    return this.http.delete(
      `${environment.url_ms_business}/direcciones/${id}`
    );
  }

  findByCiudadano(ciudadanoId: number): Observable<Direccion[]> {
    return this.http.get<Direccion[]>(
      `${environment.url_ms_business}/direcciones/ciudadano/${ciudadanoId}`
    );
  }
}
