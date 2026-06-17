import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PQRS } from '../../models/PQRS/pqrs.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PqrsService {
  private url = environment.url_ms_business;

  constructor(private http: HttpClient) { }

  private getHeaders() {
    const token = localStorage.getItem('token');

    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      }),
    };
  }

  create(body: PQRS): Observable<PQRS> {
    return this.http.post<PQRS>(`${this.url}/pqrs`, body, this.getHeaders());
  }

  view(radicado: string): Observable<PQRS> {
    return this.http.get<PQRS>(`${this.url}/pqrs/${radicado}`);
  }
}
