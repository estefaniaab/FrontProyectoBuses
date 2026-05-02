import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Nodo } from 'src/app/models/Nodos/nodo.model';

@Injectable({
  providedIn: 'root'
})
export class NodoService {
  private apiUrl = `${environment.url_ms_business}/nodos`;

  constructor(private http: HttpClient) {}

  getByRuta(rutaId: number): Observable<Nodo[]> {
    return this.http.get<Nodo[]>(`${this.apiUrl}/ruta/${rutaId}`);
  }

  getByParadero(paraderoId: number): Observable<Nodo[]> {
    return this.http.get<Nodo[]>(`${this.apiUrl}/paradero/${paraderoId}`);
  }

  add(rutaId: number, paraderoId: number, orden: number): Observable<Nodo> {
    return this.http.post<Nodo>(this.apiUrl, {
      orden,
      ruta: { id: rutaId },
      paradero: { id: paraderoId }
    });
  }

  remove(nodoId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${nodoId}`);
  }
}
