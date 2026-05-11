import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MetodoPago } from 'src/app/models/MetodosPago/metodo-pago.model';

@Injectable({
  providedIn: 'root'
})
export class MetodoPagoService {

  constructor(private http: HttpClient) {}

  list(): Observable<MetodoPago[]> {
    return this.http.get<MetodoPago[]>(
      `${environment.url_ms_business}/metodos-pago`
    );
  }

  view(id: number): Observable<MetodoPago> {
    return this.http.get<MetodoPago>(
      `${environment.url_ms_business}/metodos-pago/${id}`
    );
  }

  create(data: any): Observable<MetodoPago> {
    return this.http.post<MetodoPago>(
      `${environment.url_ms_business}/metodos-pago`,
      data
    );
  }

  update(id: number, data: any): Observable<MetodoPago> {
    return this.http.patch<MetodoPago>(
      `${environment.url_ms_business}/metodos-pago/${id}`,
      data
    );
  }

  delete(id: number): Observable<any> {
    return this.http.delete(
      `${environment.url_ms_business}/metodos-pago/${id}`
    );
  }
}
