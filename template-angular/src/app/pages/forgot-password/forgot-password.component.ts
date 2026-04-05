import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { PasswordResetService } from '../../services/PasswordReset/password-reset.service';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  email: string = '';
  recaptchaToken: string = '';
  siteKey = environment.recaptcha_site_key;

  constructor(
    private passwordResetService: PasswordResetService,
    private router: Router
  ) {}

  onRecaptchaResolved(token: string) {
    this.recaptchaToken = token;
  }

  submit() {
    if (!this.email) {
      Swal.fire('Error', 'Por favor ingresa tu email.', 'error');
      return;
    }
    if (!this.recaptchaToken) {
      Swal.fire('Error', 'Por favor completa el reCAPTCHA.', 'error');
      return;
    }

    this.passwordResetService.forgotPassword(this.email, this.recaptchaToken).subscribe({
      next: () => {
        Swal.fire(
          'Enviado',
          'Si el email existe, recibirá instrucciones de recuperación.',
          'success'
        );
        this.router.navigate(['/login']);
      },
      error: (err) => {
        Swal.fire('Error', err.error || 'Ocurrió un error.', 'error');
      }
    });
  }
}
