import { AbstractControl, ValidationErrors, ValidatorFn, FormGroup } from '@angular/forms';

/**
 * Validator para verificar si la contraseña cumple con los requisitos
 * - Mínimo 8 caracteres
 * - Al menos una mayúscula
 * - Al menos una minúscula
 * - Al menos un número
 * - Al menos un carácter especial
 */
export function passwordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null; // No validar si está vacío
    }

    const errors: ValidationErrors = {};

    // Al menos 8 caracteres
    if (value.length < 8) {
      errors['minLength'] = true;
    }

    // Al menos una mayúscula
    if (!/[A-Z]/.test(value)) {
      errors['uppercase'] = true;
    }

    // Al menos una minúscula
    if (!/[a-z]/.test(value)) {
      errors['lowercase'] = true;
    }

    // Al menos un número
    if (!/[0-9]/.test(value)) {
      errors['number'] = true;
    }

    // Al menos un carácter especial
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
      errors['specialChar'] = true;
    }

    return Object.keys(errors).length > 0 ? errors : null;
  };
}

/**
 * Validador para confirmar que las contraseñas coinciden
 */
export function passwordMatchValidator(): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    if (formGroup instanceof FormGroup) {
      const password = formGroup.get('password');
      const confirmPassword = formGroup.get('confirmPassword');

      if (password && confirmPassword && password.value !== confirmPassword.value) {
        confirmPassword.setErrors({ ...confirmPassword.errors, passwordMismatch: true });
        return { passwordMismatch: true };
      } else if (confirmPassword && confirmPassword.hasError('passwordMismatch')) {
        const errors = { ...confirmPassword.errors };
        delete errors['passwordMismatch'];
        confirmPassword.setErrors(Object.keys(errors).length > 0 ? errors : null);
      }
    }
    return null;
  };
}

/**
 * Función para calcular la fortaleza de la contraseña
 * @param password Contraseña a evaluar
 * @returns Nivel de fortaleza: 'débil' | 'media' | 'fuerte'
 */
export function calculatePasswordStrength(password: string): 'débil' | 'media' | 'fuerte' {
  if (!password) return 'débil';

  let strength = 0;

  // Contar criterios cumplidos
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++;

  if (strength <= 2) return 'débil';
  if (strength <= 4) return 'media';
  return 'fuerte';
}