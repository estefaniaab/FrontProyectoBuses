import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { PasswordResetService } from '../../services/PasswordReset/password-reset.service';
import { environment } from '../../../environments/environment';
import { ReCaptchaV3Service } from 'ng-recaptcha';


@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  email: string = '';

  constructor(
    private passwordResetService: PasswordResetService,
    private recaptchaV3Service: ReCaptchaV3Service,
    private router: Router
  ) {}


  submit() {
    if (!this.email) {
      Swal.fire('Error', 'Por favor ingresa tu email.', 'error');
      return;
    }

    this.recaptchaV3Service.execute('forgot_password').subscribe({
      next: (tokenV3) => {
        console.log('tokenV3:', tokenV3);
        this.passwordResetService.forgotPassword(this.email, tokenV3).subscribe({
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
      },
      error: () => {
        Swal.fire('Error', 'No fue posible validar reCAPTCHA.', 'error');
      }
    });
  }
}
