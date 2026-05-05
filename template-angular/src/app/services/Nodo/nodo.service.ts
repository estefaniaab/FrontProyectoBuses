// ─────────────────────────────────────────────────────────────────────────────
// src/app/services/Nodo/nodo.service.ts
// ─────────────────────────────────────────────────────────────────────────────

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of, from } from 'rxjs';
import { switchMap, concatMap, toArray } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Nodo } from 'src/app/models/Nodos/nodo.model';

export interface NodoPayloadItem {
  paraderoId: number;
  orden: number;
  distanciaDesdeAnterior: number;
  tiempoEstimado: number;
}

export interface GuardarNodosRutaPayload {
  rutaId: number;
  nodos: NodoPayloadItem[];
}

@Injectable({ providedIn: 'root' })
export class NodoService {
  private readonly apiUrl = `${environment.url_ms_business}/nodos`;

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
      paradero: { id: paraderoId },
    });
  }

  remove(nodoId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${nodoId}`);
  }

  /**
   * Reemplaza todos los nodos de una ruta usando HttpClient (pasa por el
   * interceptor JWT automáticamente):
   *  1. GET    /nodos/ruta/:id  → obtiene los nodos actuales
   *  2. DELETE /nodos/:id       → los elimina en paralelo (forkJoin)
   *  3. POST   /nodos           → crea los nuevos en secuencia (concatMap)
   *
   * El body del POST solo incluye los campos que acepta el DTO del backend:
   * { orden, ruta: { id }, paradero: { id } }
   */
  guardarNodosRuta(payload: GuardarNodosRutaPayload): Observable<any> {
    return this.getByRuta(payload.rutaId).pipe(

      // Paso 2: eliminar todos los nodos actuales en paralelo
      switchMap((existentes) => {
        if (existentes.length === 0) return of([]);
        return forkJoin(
          existentes.map((n) => this.http.delete(`${this.apiUrl}/${n.id}`))
        );
      }),

      // Paso 3: crear los nuevos nodos en orden secuencial
      switchMap(() =>
        from(payload.nodos).pipe(
          concatMap((item) =>
            this.http.post(this.apiUrl, {
              orden:    item.orden,
              ruta:     { id: payload.rutaId },
              paradero: { id: item.paraderoId },
            })
          ),
          toArray()
        )
      )
    );
  }
}
