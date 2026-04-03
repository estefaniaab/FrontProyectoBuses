import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Profile } from '../../models/Profiles/profile.model';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  constructor(private http: HttpClient) { }
  list(): Observable<Profile[]> {
      return this.http.get<Profile[]>(`${environment.url_ms_security}/profiles`);
  }
  view(id: string): Observable<Profile> {
      return this.http.get<Profile>(`${environment.url_ms_security}/profiles/${id}`);
  }
  create(newProfile: Profile): Observable<Profile> {
    delete newProfile.id;
    return this.http.post<Profile>(`${environment.url_ms_security}/profiles`, newProfile);
  }
  update(id: string, data: any): Observable<Profile> {
    return this.http.put<Profile>(`${environment.url_ms_security}/profiles/${id}`, data);
  }

  delete(id: string) {
    return this.http.delete<Profile>(`${environment.url_ms_security}/profiles/${id}`);
  }
}
