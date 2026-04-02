import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserRole } from '../../models/UsersRoles/user-role.model';

@Injectable({
  providedIn: 'root'
})
export class UserRoleService {
  constructor(private http: HttpClient) { }

  list(): Observable<UserRole[]> {
      return this.http.get<UserRole[]>(`${environment.url_ms_security}/user-role`);
    }

  view(id: string): Observable<UserRole> {
      return this.http.get<UserRole>(`${environment.url_ms_security}/user-role/${id}`);
    }
  create(newUserRole: UserRole): Observable<UserRole> {
    delete newUserRole.id;
    // Construir la URL con los IDs de usuario y rol
    return this.http.post<UserRole>(
      `${environment.url_ms_security}/user-role/user/${newUserRole.user}/role/${newUserRole.role}`,
      newUserRole
    );
  }
  update(theUserRole: UserRole): Observable<UserRole> {
    return this.http.put<UserRole>(`${environment.url_ms_security}/user-role/${theUserRole.id}`, theUserRole);
  }

  delete(id: string) {
    return this.http.delete<UserRole>(`${environment.url_ms_security}/user-role/${id}`);
  }

}
