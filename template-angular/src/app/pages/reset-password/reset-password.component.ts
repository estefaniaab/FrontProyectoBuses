import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { PasswordResetService } from '../../services/PasswordReset/password-reset.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  token: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  constructor(
    private activatedRoute: ActivatedRoute,
    private passwordResetService: PasswordResetService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // ✅ Capturar el token del enlace
    this.token = this.activatedRoute.snapshot.queryParams['token'];
    if (!this.token) {
      Swal.fire('Error', 'Token inválido.', 'error');
      this.router.navigate(['/login']);
    }
  }

  submit() {
    if (!this.newPassword || !this.confirmPassword) {
      Swal.fire('Error', 'Por favor completa todos los campos.', 'error');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      Swal.fire('Error', 'Las contraseñas no coinciden.', 'error');
      return;
    }
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
      if (!passwordRegex.test(this.newPassword)) {
        Swal.fire(
          'Contraseña inválida',
          'La contraseña debe tener mínimo 8 caracteres, al menos una mayúscula, una minúscula, un número y un carácter especial.',
          'error'
        );
        return;
      }
    this.passwordResetService.resetPassword(this.token, this.newPassword).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Contraseña actualizada correctamente.', 'success');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        Swal.fire('Error', 'Token inválido o expirado.', 'error');
      }
    });
  }
}
