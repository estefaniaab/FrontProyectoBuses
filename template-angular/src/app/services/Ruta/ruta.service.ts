import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Ruta } from '../../models/Rutas/ruta.model';

@Injectable({
  providedIn: 'root'
})
export class RutaService {
  constructor(private http: HttpClient) { }

   list(nombre?: string): Observable<Ruta[]> {
      let url = `${environment.url_ms_business}/rutas`;

      if (nombre && nombre.trim() !== '') {
        url += `?nombre=${encodeURIComponent(nombre.trim())}`;
      }

      return this.http.get<Ruta[]>(url);
    }

  view(id: number): Observable<Ruta> {
    return this.http.get<Ruta>(`${environment.url_ms_business}/rutas/${id}`);
  }

  create(newRuta: Ruta): Observable<Ruta> {
    delete newRuta.id;
    return this.http.post<Ruta>(`${environment.url_ms_business}/rutas`, newRuta);
  }

  update(theRuta: Ruta): Observable<Ruta> {
    const body: any = { ...theRuta };

    delete body.id;

    body.tarifa = Number(body.tarifa);
    body.tiempoEstimadoTotal = Number(body.tiempoEstimadoTotal);

    return this.http.patch<Ruta>(
      `${environment.url_ms_business}/rutas/${theRuta.id}`,
      body
    );
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${environment.url_ms_business}/rutas/${id}`);
  }
}
