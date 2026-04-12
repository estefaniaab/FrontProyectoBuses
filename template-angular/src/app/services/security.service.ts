import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/Users/user.model';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SecurityService {

  theUser = new BehaviorSubject<User>(new User);
  constructor(private http: HttpClient) {
    this.verifyActualSession()
  }

  /**
  * Realiza la petición al backend con el correo y la contraseña
  * para verificar si existe o no en la plataforma
  * @param infoUsuario JSON con la información de correo y contraseña
  * @returns Respuesta HTTP la cual indica si el usuario tiene permiso de acceso
  */
  login(user: User): Observable<any> {
    return this.http.post<any>(`${environment.url_ms_security}/public/security/login`, user);
  }

  /**
   * Registra un nuevo usuario en el sistema
   * Envía nombre, apellido, email y contraseña al backend
   * El backend se encarga de cifrar la contraseña y enviar el email de confirmación
   * @param data Objeto con nombre, apellido, email y password
   * @returns Respuesta HTTP del backend
   */
  register(data: { nombre: string; apellido: string; email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${environment.url_ms_security}/public/security/register`, data);
  }

  /*
  Guardar la información de usuario en el local storage
  */
  saveSession(dataSession: any) {
    let data: any = {
      id: dataSession["user"]["id"],
      name: dataSession["user"]["name"],
      email: dataSession["user"]["email"],
      password: "",
      token: dataSession["token"]
    };

    localStorage.setItem('session', JSON.stringify(data));
    this.setUser(data);
  }

  saveToken(token: string) {
    let currentSession = JSON.parse(this.getSessionData() || '{}');
    currentSession.token = token;
    localStorage.setItem('session', JSON.stringify(currentSession));
    this.setUser(currentSession);
  }
  /**
    * Permite actualizar la información del usuario
    * que acabó de validarse correctamente
    * @param user información del usuario logueado
  */
  setUser(user: User) {
    this.theUser.next(user);
  }
  /**
  * Permite obtener la información del usuario
  * con datos tales como el identificador y el token
  * @returns
  */
  getUser() {
    return this.theUser.asObservable();
  }
  /**
    * Permite obtener la información de usuario
    * que tiene la función activa y servirá
    * para acceder a la información del token
*/
  public get activeUserSession(): User {
    return this.theUser.value;
  }

  /**
  * Permite cerrar la sesión del usuario
  * que estaba previamente logueado
  */
  logout() {
    localStorage.removeItem('session');
    this.setUser(new User());
  }
  /**
  * Permite verificar si actualmente en el local storage
  * existe información de un usuario previamente logueado
  */
  verifyActualSession() {
    let actualSession = this.getSessionData();
    if (actualSession) {
      this.setUser(JSON.parse(actualSession));
    }
  }
  /**
  * Verifica si hay una sesion activa
  * @returns
  */
  existSession(): boolean {
    let sessionActual = this.getSessionData();
    return (sessionActual) ? true : false;
  }
  /**
  * Permite obtener los dato de la sesión activa en el
  * local storage
  * @returns
  */
  getSessionData() {
    let sessionActual = localStorage.getItem('session');
    return sessionActual;
  }

  saveOAuthSession(token: string) {
    const payload = JSON.parse(atob(token.split('.')[1]));

    let data: any = {
      id: payload.id,
      name: payload.name,
      email: payload.email,
      password: '',
      token: token
    };

    localStorage.setItem('session', JSON.stringify(data));
    this.setUser(data);
  }
}