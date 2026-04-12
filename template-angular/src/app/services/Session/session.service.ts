import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Session } from '../../models/Sessions/session.model';


@Injectable({
  providedIn: 'root'
})
export class SessionService {

  constructor(private http: HttpClient) { }
  list(): Observable<Session[]> {
      return this.http.get<Session[]>(`${environment.url_ms_security}/sessions`);
  }
    view(id: string): Observable<Session> {
      return this.http.get<Session>(`${environment.url_ms_security}/sessions/${id}`);
    }
    create(newSession: Session): Observable<Session> {
      delete newSession.id;
      return this.http.post<Session>(`${environment.url_ms_security}/session`, newSession);
    }
    update(theSession: Session): Observable<Session> {
      return this.http.put<Session>(`${environment.url_ms_security}/sessions/${theSession.id}`, theSession);
    }

    delete(id: string) {
      return this.http.delete<Session>(`${environment.url_ms_security}/sessions/${id}`);
    }
}
