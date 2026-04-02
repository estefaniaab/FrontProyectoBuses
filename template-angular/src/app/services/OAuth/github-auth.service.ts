import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class GithubAuthService {
  constructor(private http: HttpClient) {}

  getGithubUrl(): Observable<{ url: string }> {
    return this.http.get<{ url: string }>(
      `${environment.url_ms_security}/auth/github/url`
    );
  }
}
