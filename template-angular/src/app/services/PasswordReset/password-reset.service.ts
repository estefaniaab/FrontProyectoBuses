import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PasswordResetService {
  constructor(private http: HttpClient) {}

  forgotPassword(email: string, recaptchaToken: string): Observable<any> {
    const params = new HttpParams()
      .set('email', email)
      .set('recaptchaToken', recaptchaToken);
    return this.http.post(
      `${environment.url_ms_security}/auth/password/forgot`,
      null,
      { params, responseType: 'text' }
    );
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    const params = new HttpParams()
      .set('token', token)
      .set('newPassword', newPassword);
    return this.http.post(
      `${environment.url_ms_security}/auth/password/reset`,
      null,
      { params, responseType: 'text' }
    );
  }
}
