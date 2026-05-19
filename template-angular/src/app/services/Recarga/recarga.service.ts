import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Recarga } from '../../models/Recargas/recarga.model';

@Injectable({
  providedIn: 'root'
})
export class RecargaService {

  constructor(private http: HttpClient) {}

  list(): Observable<Recarga[]> {
    return this.http.get<Recarga[]>(`${environment.url_ms_business}/recargas`);
  }

  view(id: number): Observable<Recarga> {
    return this.http.get<Recarga>(`${environment.url_ms_business}/recargas/${id}`);
  }

  create(newRecarga: Recarga): Observable<Recarga> {
    delete newRecarga.id;
    return this.http.post<Recarga>(`${environment.url_ms_business}/recargas`, newRecarga);
  }

  update(id: number, data: Recarga): Observable<Recarga> {
    return this.http.patch<Recarga>(`${environment.url_ms_business}/recargas/${id}`, data);
  }

  findByCiudadano(ciudadanoId: number): Observable<Recarga[]> {
    return this.http.get<Recarga[]>(
      `${environment.url_ms_business}/recargas/ciudadano/${ciudadanoId}`
    );
  }
}
