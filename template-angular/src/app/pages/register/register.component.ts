import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/User/user.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  registerForm!: FormGroup;

  showPassword        = false;
  showConfirmPassword = false;

  req = {
    length:  false,
    upper:   false,
    lower:   false,
    number:  false,
    special: false,
  };

  strengthScore = 0;

  private readonly strengthColors = ['', '#E24B4A', '#BA7517', '#639922', '#0F6E56'];
  private readonly strengthTexts  = ['—', 'Débil', 'Regular', 'Buena', 'Fuerte'];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      nombre:          ['', Validators.required],
      email:           ['', [Validators.required, Validators.email]],
      password:        ['', Validators.required],
      confirmPassword: ['', Validators.required],
      acceptTerms:     [false, Validators.requiredTrue],
    });

    this.registerForm.get('password')?.valueChanges.subscribe((val: string) => {
      this.evaluatePassword(val || '');
    });
  }

  togglePassword(): void { this.showPassword = !this.showPassword; }
  toggleConfirmPassword(): void { this.showConfirmPassword = !this.showConfirmPassword; }

  private evaluatePassword(val: string): void {
    this.req.length  = val.length >= 8;
    this.req.upper   = /[A-Z]/.test(val);
    this.req.lower   = /[a-z]/.test(val);
    this.req.number  = /[0-9]/.test(val);
    this.req.special = /[^A-Za-z0-9]/.test(val);
    this.strengthScore = Object.values(this.req).filter(Boolean).length;
  }

  get strengthColor(): string { return this.strengthColors[this.strengthScore] ?? '#8898aa'; }

  get strengthText(): string {
    const pass = this.registerForm.get('password')?.value;
    return pass ? (this.strengthTexts[this.strengthScore] ?? '—') : '—';
  }

  strengthSegColor(index: number): string {
    return index < this.strengthScore
      ? (this.strengthColors[this.strengthScore] ?? '#dee2e6')
      : '#dee2e6';
  }

  get passwordsMatch(): boolean {
    const p = this.registerForm.get('password')?.value;
    const c = this.registerForm.get('confirmPassword')?.value;
    return p === c;
  }

  isInvalid(field: string): boolean {
    const ctrl = this.registerForm.get(field);
    return !!ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }

  onSubmit(): void {


    if (this.registerForm.invalid || !this.passwordsMatch) {
      console.log("Formulario inválido ❌");
      return;
    }

    console.log("Formulario válido ✅");

    const { nombre, email, password } = this.registerForm.value;

    const newUser: any = {
      name: nombre,
      lastName: "",
      email: email,
      password: password,
      confirmPassword: password
    };

    console.log("Enviando usuario:", newUser);

    this.userService.create(newUser).subscribe({
      next: (response) => {
        console.log("Usuario creado:", response);
        alert("Cuenta creada correctamente. Inicia sesión.");
        this.registerForm.reset();
        this.router.navigate(['/login']);
      },

      error: (error) => {
        console.error("Error al crear usuario:", error);
        console.error("error.status:", error.status);
        console.error("error.error:", error.error);

        let mensaje = "Error al crear cuenta";

        if (error.status === 409 || error.status === 400) {
          // Conflicto: email ya registrado (ajusta el código según tu backend)
          mensaje = "El correo ya está registrado. Intenta con otro.";
        } else if (typeof error.error === 'string' && error.error.trim() !== '') {
          mensaje = error.error;
        } else if (error.error?.message) {
          mensaje = error.error.message;
        } else if (error.message) {
          mensaje = error.message;
        }

        alert(mensaje);
      }
    });
  }
}
