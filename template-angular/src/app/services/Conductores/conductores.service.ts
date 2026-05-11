import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Conductor } from '../../models/Conductores/conductor.model';
import { User } from '../../models/Users/user.model';

@Injectable({
  providedIn: 'root'
})
export class ConductoresService {

  constructor(private http: HttpClient) { }

  /**
   * GET: Obtiene la lista de usuarios desde SEGURIDAD
   */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.url_ms_security}/users`);
  }

  /**
   * GET: Obtiene todos los conductores (Negocio)
   */
  findAll(): Observable<Conductor[]> {
    return this.http.get<Conductor[]>(`${environment.url_ms_business}/conductores`);
  }

  /**
   * GET: Obtiene un conductor por ID
   */
  view(id: number): Observable<Conductor> {
    return this.http.get<Conductor>(`${environment.url_ms_business}/conductores/${id}`);
  }

  /**
   * POST: Crea un nuevo conductor
   */
  create(newConductor: Conductor): Observable<Conductor> {
    // Enviamos el objeto tal cual.
    // Al NO usar Number(), el userId viaja como "69abc" completo.
    return this.http.post<Conductor>(`${environment.url_ms_business}/conductores`, newConductor);
  }

  /**
   * PATCH: Actualiza un conductor existente
   */
  update(theConductor: any): Observable<Conductor> {
    const id = theConductor.id;
    const body = { ...theConductor };
    delete body.id;

    // Eliminamos la conversión numérica para que el ID alfanumérico se mantenga íntegro
    return this.http.patch<Conductor>(`${environment.url_ms_business}/conductores/${id}`, body);
  }

  /**
   * DELETE: Elimina un conductor
   */
  remove(id: number): Observable<any> {
    return this.http.delete<any>(`${environment.url_ms_business}/conductores/${id}`);
  }
}
