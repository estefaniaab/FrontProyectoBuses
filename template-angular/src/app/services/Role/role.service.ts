import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Role } from '../../models/Roles/role.model';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  constructor(private http: HttpClient) { }
  list(): Observable<Role[]> {
    return this.http.get<Role[]>(`${environment.url_ms_security}/roles`);
  }
  view(id: number): Observable<Role> {
    return this.http.get<Role>(`${environment.url_ms_security}/roles/${id}`);
  }
  create(newRole: Role): Observable<Role> {
    delete newRole.id;
    return this.http.post<Role>(`${environment.url_ms_security}/roles`, newRole);
  }
  update(theRole: Role): Observable<Role> {
    return this.http.put<Role>(`${environment.url_ms_security}/roles/${theRole.id}`, theRole);
  }

  delete(id: number) {
    return this.http.delete<Role>(`${environment.url_ms_security}/roles/${id}`);
  }

}
