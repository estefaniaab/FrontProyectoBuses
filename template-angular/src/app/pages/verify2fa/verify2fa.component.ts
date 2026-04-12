import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { TwoFactorService } from '../../services/Verify2fa/two-factor.service';
import { SecurityService } from '../../services/security.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-verify2fa',
  templateUrl: './verify2fa.component.html',
  styleUrls: ['./verify2fa.component.scss']
})
export class Verify2faComponent implements OnInit, OnDestroy {
  code: string = '';
  challengeId: string = '';
  maskedEmail: string = '';
  remainingAttempts: number = 3;
  timeLeft: number = 300;
  timer: any;

  constructor(
    private twoFactorService: TwoFactorService,
    private securityService: SecurityService,
    private router: Router) {}

  ngOnInit(): void {
    const data = sessionStorage.getItem('twoFactorData');

    if (!data) {
      this.router.navigate(['/login']);
      return;
    }

    const parsed = JSON.parse(data);
    this.challengeId = parsed.challengeId;
    this.maskedEmail = parsed.maskedEmail;
    this.remainingAttempts = parsed.remainingAttempts;
    this.timeLeft = parsed.expiresInSeconds;

    this.startTimer();
    window.addEventListener('beforeunload', this.handleBeforeUnload);
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
  }

  startTimer(): void {
    this.timer = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        clearInterval(this.timer);
        sessionStorage.removeItem('twoFactorData');
        Swal.fire('Expirado', 'El código expiró. Debe volver a iniciar sesión.', 'warning');
        this.router.navigate(['/login']);
      }
    }, 1000);
  }

  formatTime(seconds: number): string {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  }

  onCodeInput(event: any): void {
    this.code = event.target.value.replace(/\D/g, '').slice(0, 6);
  }

  onPaste(event: ClipboardEvent): void {
    const pasted = event.clipboardData?.getData('text') || '';
    this.code = pasted.replace(/\D/g, '').slice(0, 6);
    event.preventDefault();
  }

  verifyCode(): void {
    if (this.code.length !== 6) {
      Swal.fire('Error', 'Ingrese un código válido de 6 dígitos.', 'error');
      return;
    }

    this.twoFactorService.verifyCode(this.challengeId, this.code).subscribe({
      next: (res: any) => {
        sessionStorage.removeItem('twoFactorData');
        this.securityService.saveSession(res);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        const error = err.error;

        if (error.remainingAttempts !== undefined) {
          this.remainingAttempts = error.remainingAttempts;
        }

        Swal.fire('Error', error.message || 'Código inválido.', 'error');

        if (
          error.message?.includes('volver a iniciar sesión') ||
          error.message?.includes('expiró')
        ) {
          sessionStorage.removeItem('twoFactorData');
          this.router.navigate(['/login']);
        }
      }
    });
  }

  resendCode(): void {
    this.twoFactorService.resendCode(this.challengeId).subscribe({
      next: (res: any) => {
        if (this.timer) {
          clearInterval(this.timer);
        }
        this.timeLeft = res.expiresInSeconds;
        this.remainingAttempts = res.remainingAttempts;
        sessionStorage.setItem('twoFactorData', JSON.stringify({
          challengeId: this.challengeId,
          maskedEmail: this.maskedEmail,
          remainingAttempts: this.remainingAttempts,
          expiresInSeconds: this.timeLeft
        }));

        this.startTimer();
        Swal.fire('Enviado', 'Se reenvió un nuevo código a su correo.', 'success');
      },
      error: (err) => {
        const error = err.error;
        Swal.fire('Error', error.message || 'No fue posible reenviar el código.', 'error');

        if (error.message?.includes('volver a iniciar sesión') ||error.message?.includes('expiró')) {
          sessionStorage.removeItem('twoFactorData');
          this.router.navigate(['/login']);
        }
      }
    });
  }

  cancelAndBack(): void {
    this.twoFactorService.cancel(this.challengeId).subscribe({
      next: () => {
        sessionStorage.removeItem('twoFactorData');
        this.router.navigate(['/login']);
      },
      error: () => {
        sessionStorage.removeItem('twoFactorData');
        this.router.navigate(['/login']);
      }
    });
  }

  handleBeforeUnload = () => {
    if (!this.challengeId) return;

    const data = JSON.stringify({ challengeId: this.challengeId });
    const blob = new Blob([data], { type: 'application/json' });

    navigator.sendBeacon(`${environment.url_ms_security}/security/2fa/cancel`, blob);
  };
}
