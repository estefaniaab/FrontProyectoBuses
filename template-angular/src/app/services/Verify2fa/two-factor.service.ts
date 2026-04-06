import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TwoFactorService {
  constructor(private http: HttpClient) {}

  verifyCode(challengeId: string, code: string): Observable<any> {
    return this.http.post(`${environment.url_ms_security}/security/2fa/verify`, {
      challengeId,
      code
    });
  }
  resendCode(challengeId: string): Observable<any> {
    return this.http.post(`${environment.url_ms_security}/security/2fa/resend`, {
      challengeId
    });
  }
  cancel(challengeId: string): Observable<any> {
    return this.http.post(`${environment.url_ms_security}/security/2fa/cancel`, {
      challengeId
    });
  }
}
