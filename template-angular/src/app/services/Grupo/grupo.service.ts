import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Grupo,
  MembresiaGrupo,
  LogMembresiaGrupo,
  RolMembresia,
} from '../../models/Grupos/grupo.model';

@Injectable({ providedIn: 'root' })
export class GrupoService {
  private base = `${environment.url_ms_business}/grupos`;

  constructor(private http: HttpClient) {}

  // FIX: parámetro cambiado a 'busqueda' para buscar en nombre Y descripción
  list(busqueda?: string): Observable<Grupo[]> {
    let url = this.base;
    if (busqueda?.trim()) {
      url += `?busqueda=${encodeURIComponent(busqueda.trim())}`;
    }
    return this.http.get<Grupo[]>(url);
  }

  view(id: number): Observable<Grupo> {
    return this.http.get<Grupo>(`${this.base}/${id}`);
  }

  create(grupo: Partial<Grupo>): Observable<Grupo> {
    return this.http.post<Grupo>(this.base, grupo);
  }

  update(id: number, grupo: Partial<Grupo>): Observable<Grupo> {
    return this.http.patch<Grupo>(`${this.base}/${id}`, grupo);
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/${id}`);
  }

  unirse(grupoId: number, usuarioId: string): Observable<MembresiaGrupo> {
    return this.http.post<MembresiaGrupo>(`${this.base}/${grupoId}/unirse`, { usuarioId });
  }

  abandonar(grupoId: number, usuarioId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/${grupoId}/abandonar/${usuarioId}`);
  }

  // FIX: verificar si el usuario es miembro antes de entrar al chat

  verificarMembresia(grupoId: number, usuarioId: string): Observable<{ esMiembro: boolean; soloLectura: boolean }> {
    return this.http.get<{ esMiembro: boolean; soloLectura: boolean }>(`${this.base}/${grupoId}/membresia/${usuarioId}`);
  }
  listarMiembros(grupoId: number, nombre?: string): Observable<MembresiaGrupo[]> {
    let url = `${this.base}/${grupoId}/miembros`;
    if (nombre?.trim()) url += `?nombre=${encodeURIComponent(nombre.trim())}`;
    return this.http.get<MembresiaGrupo[]>(url);
  }

  promover(
    grupoId: number,
    usuarioId: string,
    rol: RolMembresia,
    actorUsuarioId: string,
  ): Observable<MembresiaGrupo> {
    return this.http.patch<MembresiaGrupo>(`${this.base}/${grupoId}/miembros/promover`, {
      usuarioId, rol, actorUsuarioId,
    });
  }

  remover(
    grupoId: number,
    usuarioId: string,
    actorUsuarioId: string,
  ): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/${grupoId}/miembros/remover`, {
      body: { usuarioId, actorUsuarioId },
    });
  }

  bloquear(
    grupoId: number,
    usuarioId: string,
    actorUsuarioId: string,
  ): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.base}/${grupoId}/miembros/bloquear`, {
      usuarioId, actorUsuarioId,
    });
  }

  obtenerLogs(grupoId: number): Observable<LogMembresiaGrupo[]> {
    return this.http.get<LogMembresiaGrupo[]>(`${this.base}/${grupoId}/logs`);
  }
}
