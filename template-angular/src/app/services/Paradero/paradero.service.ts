import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Paradero, ParaderoCercano } from 'src/app/models/Paradero/paradero.model';

@Injectable({
  providedIn: 'root'
})
export class ParaderoService {
  private apiUrl = `${environment.url_ms_business}/api/paraderos`;

  constructor(private http: HttpClient) {}

  // ─── CRUD completo ────────────────────────────────────────────────────────

  getAll(): Observable<Paradero[]> {
    return this.http.get<Paradero[]>(this.apiUrl);
  }

  getOne(id: number): Observable<Paradero> {
    return this.http.get<Paradero>(`${this.apiUrl}/${id}`);
  }

  crear(dto: Omit<Paradero, 'id'>): Observable<Paradero> {
    return this.http.post<Paradero>(this.apiUrl, dto);
  }

  actualizar(id: number, dto: Partial<Omit<Paradero, 'id'>>): Observable<Paradero> {
    return this.http.patch<Paradero>(`${this.apiUrl}/${id}`, dto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ─── Búsqueda cercana (HU-ENTR-2-002) ────────────────────────────────────

  buscarCercanos(lat: number, lng: number): Observable<ParaderoCercano[]> {
    return this.http.get<ParaderoCercano[]>(`${this.apiUrl}/cercanos`, {
      params: { lat, lng },
    });
  }
}
