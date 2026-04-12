import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserRoleService {
  constructor(private http: HttpClient) {}

  list(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.url_ms_security}/user-role/user`);
  }

  view(userId: string): Observable<any> {
    return this.http.get<any>(`${environment.url_ms_security}/user-role/user/${userId}`);
  }

  create(userId: string, roleIds: string[]): Observable<any> {
    return this.http.post<any>(
      `${environment.url_ms_security}/user-role/user/${userId}`,
      { roleIds }
    );
  }

  update(userId: string, roleIds: string[]): Observable<any> {
    return this.http.put<any>(
      `${environment.url_ms_security}/user-role/user/${userId}`,
      { roleIds }
    );
  }

  delete(userId: string): Observable<any> {
    return this.http.delete<any>(`${environment.url_ms_security}/user-role/user/${userId}`);
  }
}
