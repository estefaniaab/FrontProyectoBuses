import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Bus } from '../../models/Buses/bus.model';

@Injectable({
  providedIn: 'root'
})
export class BusService {
  constructor(private http: HttpClient) { }

  list(placa?: string): Observable<Bus[]> {
    let url = `${environment.url_ms_business}/buses`;

    if (placa && placa.trim() !== '') {
      url += `?placa=${encodeURIComponent(placa.trim())}`;
    }

    return this.http.get<Bus[]>(url);
  }

  view(id: number): Observable<Bus> {
    return this.http.get<Bus>(`${environment.url_ms_business}/buses/${id}`);
  }

  create(newBus: Bus): Observable<Bus> {
    const body: any = { ...newBus };

    delete body.id;
    delete body.codigoQr;

    body.anio = Number(body.anio);
    body.capacidadMaximaPasajeros = Number(body.capacidadMaximaPasajeros);
    body.capacidadSentados = Number(body.capacidadSentados);
    body.capacidadParados = Number(body.capacidadParados);

    return this.http.post<Bus>(`${environment.url_ms_business}/buses`, body);
  }

  update(theBus: Bus): Observable<Bus> {
    const body: any = { ...theBus };

    delete body.id;
    delete body.codigoQr;

    body.anio = Number(body.anio);
    body.capacidadMaximaPasajeros = Number(body.capacidadMaximaPasajeros);
    body.capacidadSentados = Number(body.capacidadSentados);
    body.capacidadParados = Number(body.capacidadParados);

    return this.http.patch<Bus>(
      `${environment.url_ms_business}/buses/${theBus.id}`,
      body
    );
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${environment.url_ms_business}/buses/${id}`);
  }
}
