import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../models/Users/user.model';
import { SecurityService } from '../../services/security.service';
import { GithubAuthService } from '../../services/OAuth/github-auth.service';
import { MicrosoftAuthService } from '../../services/OAuth/microsoft-auth.service';
import { GoogleAuthService } from '../../services/OAuth/google-auth.service';
import { ReCaptchaV3Service } from 'ng-recaptcha';  // ← añade
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  user: User = new User();
  showPassword: boolean = false;

  constructor(
    private securityService: SecurityService,
    private githubAuthService: GithubAuthService,
    private microsoftAuthService: MicrosoftAuthService,
    private googleAuthService: GoogleAuthService,
    private router: Router,
    private recaptchaV3Service: ReCaptchaV3Service  // ← añade
  ) {}

  ngOnInit() {}

  ngOnDestroy() {}

  login() {
    this.recaptchaV3Service.execute('login').subscribe({  // ← envuelve el login
      next: (token) => {
        console.log("USER ENVIADO:", this.user);
        this.securityService.login(this.user, token).subscribe({  // ← pasa el token
          next: (response) => {
            console.log('LOGIN RESPONSE:', response);
            sessionStorage.setItem('twoFactorData', JSON.stringify({
              challengeId: response.challengeId,
              maskedEmail: response.maskedEmail,
              expiresInSeconds: response.expiresInSeconds,
              remainingAttempts: response.remainingAttempts
            }));
            this.router.navigate(['/verify-2fa']);
          },
          error: (err) => {
            Swal.fire({
              title: 'Error',
              text: 'Email o contraseña incorrectos.',
              icon: 'error',
            });
          }
        });
      },
      error: () => {
        Swal.fire({
          title: 'Error',
          text: 'Error al verificar reCAPTCHA.',
          icon: 'error',
        });
      }
    });
  }

  loginWithGithub() {
    this.githubAuthService.getGithubUrl().subscribe({
      next: (res) => window.location.href = res.url,
      error: (err) => console.error(err)
    });
  }

  loginWithMicrosoft() {
    this.microsoftAuthService.getMicrosoftUrl().subscribe({
      next: (res) => window.location.href = res.url,
      error: (err) => console.error(err)
    });
  }

  loginWithGoogle() {
    this.googleAuthService.getGoogleUrl().subscribe({
      next: (res) => window.location.href = res.url,
      error: (err) => console.error(err)
    });
  }
}
