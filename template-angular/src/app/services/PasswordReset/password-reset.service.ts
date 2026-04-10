import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PasswordResetService {
  constructor(private http: HttpClient) {}

  forgotPassword(email: string, recaptchaTokenV3: string): Observable<any> {
    const params = new HttpParams()
      .set('email', email)
      .set('recaptchaTokenV3', recaptchaTokenV3);
    return this.http.post(
      `${environment.url_ms_security}/public/auth/password/forgot`,
      null,
      { params, responseType: 'text' }
    );
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    const params = new HttpParams()
      .set('token', token)
      .set('newPassword', newPassword);
    return this.http.post(
      `${environment.url_ms_security}/public/auth/password/reset`,
      null,
      { params, responseType: 'text' }
    );
  }
}
