import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const session = localStorage.getItem('session');
    let token: string | null = null;

    if (session) {
      const data = JSON.parse(session);
      token = data?.token || null;
    }

    if (
      request.url.includes('/login') ||
      request.url.includes('/token-validation') ||
      request.url.includes('/auth/github') ||
      request.url.includes('/auth/google') ||
      request.url.includes('/auth/microsoft') ||
      request.url.includes('recaptcha.google.com') ||
      request.url.includes('/auth/password') ||
      request.method === 'OPTIONS'
    ) {
      return next.handle(request);
    }

    if (!token) {
      return next.handle(request);
    }

    const authRequest = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    return next.handle(authRequest).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401) {
          Swal.fire({
            title: 'No está autorizado para esta operación',
            icon: 'error',
            timer: 5000
          });
          this.router.navigateByUrl('/dashboard');
        } else if (err.status === 400) {
          Swal.fire({
            title: 'Existe un error, contacte al administrador',
            icon: 'error',
            timer: 5000
          });
        }

        return throwError(() => err);
      })
    );
  }
}
