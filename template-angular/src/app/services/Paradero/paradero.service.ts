// ─────────────────────────────────────────────────────────────────────────────
// src/app/services/Paradero/paradero.service.ts
// ─────────────────────────────────────────────────────────────────────────────

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Paradero } from 'src/app/models/Paradero/paradero.model';

@Injectable({ providedIn: 'root' })
export class ParaderoService {
  private readonly apiUrl = `${environment.url_ms_business}/paraderos`;

  constructor(private http: HttpClient) {}

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

  buscarCercanos(lat: number, lng: number): Observable<Paradero[]> {
    return this.http.get<Paradero[]>(`${this.apiUrl}/cercanos`, {
      params: { lat, lng },
    });
  }
}
