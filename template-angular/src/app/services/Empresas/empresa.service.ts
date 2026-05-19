import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { Empresa } from 'src/app/models/Empresas/empresa.model';

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {

  private url = `${environment.url_ms_business}/empresas`;

  constructor(private http: HttpClient) {}

  list(nombre?: string): Observable<Empresa[]> {
    let params = new HttpParams();

    if (nombre) {
      params = params.set('nombre', nombre);
    }

    return this.http.get<Empresa[]>(this.url, { params });
  }

  view(id: number): Observable<Empresa> {
    return this.http.get<Empresa>(`${this.url}/${id}`);
  }

  create(empresa: Empresa): Observable<Empresa> {
    return this.http.post<Empresa>(this.url, empresa);
  }

  update(empresa: Empresa): Observable<Empresa> {
    return this.http.patch<Empresa>(`${this.url}/${empresa.id}`, empresa);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.url}/${id}`);
  }
}
