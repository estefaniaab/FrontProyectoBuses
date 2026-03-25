import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../../models/Users/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient) { }
  list(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.url_ms_security}/users`);
  }
  view(id: number): Observable<User> {
    return this.http.get<User>(`${environment.url_ms_security}/users/${id}`);
  }
  create(newUser: User): Observable<User> {
    delete newUser.id;
    return this.http.post<User>(`${environment.url_ms_security}/users`, newUser);
  }
  update(theUser: User): Observable<User> {
    return this.http.put<User>(`${environment.url_ms_security}/users/${theUser.id}`, theUser);
  }

  delete(id: number) {
    return this.http.delete<User>(`${environment.url_ms_security}/users/${id}`);
  }

}
