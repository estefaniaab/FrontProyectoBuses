import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { Historial } from 'src/app/models/Historial/historial.model';

@Injectable({
  providedIn: 'root'
})
export class HistorialService {

  constructor(private http: HttpClient) {}

  list(): Observable<Historial[]> {
    return this.http.get<Historial[]>(
      `${environment.url_ms_business}/historial`
    );
  }

  view(id: number): Observable<Historial> {
    return this.http.get<Historial>(
      `${environment.url_ms_business}/historial/${id}`
    );
  }

  findByBoleto(boletoId: number): Observable<Historial[]> {
    return this.http.get<Historial[]>(
      `${environment.url_ms_business}/historial/boleto/${boletoId}`
    );
  }

  findByNodo(nodoId: number): Observable<Historial[]> {
    return this.http.get<Historial[]>(
      `${environment.url_ms_business}/historial/nodo/${nodoId}`
    );
  }

  getNodosByRuta(rutaId: number) {
    return this.http.get<any[]>(
      `${environment.url_ms_business}/nodos/ruta/${rutaId}`
    );
  }

   getTurnoByBusAndFecha(busId: number, fecha: string) {
     return this.http.get<any>(
       `${environment.url_ms_business}/turnos/bus/${busId}/en-fecha?fecha=${encodeURIComponent(fecha)}`
     );
   }

  findByCiudadano(ciudadanoId: number) {
    return this.http.get<Historial[]>(
      `${environment.url_ms_business}/historial/ciudadano/${ciudadanoId}`
    );
  }
}
