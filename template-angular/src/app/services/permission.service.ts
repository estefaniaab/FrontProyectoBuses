import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Permission } from '../models/Permissions/permission.model';
import {environment} from "src/environments/environment";

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private apiUrl = `${environment.url_ms_security}/permissions`;

  constructor(private http: HttpClient) {}

  list(): Observable<Permission[]> {
    return this.http.get<Permission[]>(this.apiUrl);
  }

  findById(id: string): Observable<Permission> {
    return this.http.get<Permission>(`${this.apiUrl}/${id}`);
  }

  create(permission: Permission): Observable<Permission> {
    return this.http.post<Permission>(this.apiUrl, permission);
  }

  update(id: string, permission: Permission): Observable<Permission> {
    return this.http.put<Permission>(`${this.apiUrl}/${id}`, permission);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
