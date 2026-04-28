import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RolePermission } from '../models/RolePermission/role-permission.model';
import {environment} from "src/environments/environment";

@Injectable({
  providedIn: 'root'
})
export class RolePermissionService {
  private apiUrl = `${environment.url_ms_security}/role-permission`;

  constructor(private http: HttpClient) {}

  getByRole(roleId: string): Observable<RolePermission[]> {
    return this.http.get<RolePermission[]>(`${this.apiUrl}/role/${roleId}`);
  }

  add(roleId: string, permissionId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/role/${roleId}/permission/${permissionId}`, {});
  }

  remove(rolePermissionId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${rolePermissionId}`);
  }
}
