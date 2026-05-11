import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Ciudadano } from 'src/app/models/Ciudadanos/ciudadano.model';

@Injectable({
  providedIn: 'root'
})
export class CiudadanoService {

  constructor(private http: HttpClient) {}

  list(): Observable<Ciudadano[]> {
    return this.http.get<Ciudadano[]>(
      `${environment.url_ms_business}/ciudadanos`
    );
  }

  view(id: number): Observable<Ciudadano> {
    return this.http.get<Ciudadano>(
      `${environment.url_ms_business}/ciudadanos/${id}`
    );
  }

  create(data: any): Observable<Ciudadano> {
    return this.http.post<Ciudadano>(
      `${environment.url_ms_business}/ciudadanos`,
      data
    );
  }

  update(id: number, data: any): Observable<Ciudadano> {
    return this.http.patch<Ciudadano>(
      `${environment.url_ms_business}/ciudadanos/${id}`,
      data
    );
  }

  delete(id: number): Observable<any> {
    return this.http.delete(
      `${environment.url_ms_business}/ciudadanos/${id}`
    );
  }

  findByUsuarioId(usuarioId: string): Observable<Ciudadano> {
    return this.http.get<Ciudadano>(
      `${environment.url_ms_business}/ciudadanos/usuario/${usuarioId}`
    );
  }

  findOrCreateByUsuarioId(usuarioId: string): Observable<Ciudadano> {
    return this.http.post<Ciudadano>(
      `${environment.url_ms_business}/ciudadanos/usuario/${usuarioId}/find-or-create`,
      {}
    );
  }
}
