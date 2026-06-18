import { Component } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-consultar-pqrs',
  templateUrl: './consultar-pqrs.component.html',
})
export class ConsultarPqrsComponent {
  radicadoInput = '';

  constructor(private router: Router) {}

  buscar(): void {
    if (!this.radicadoInput.trim()) {
      Swal.fire('Atención', 'Por favor ingresa un número de radicado válido.', 'warning');
      return;
    }

    // 🟢 Te redirige a la ruta de solo lectura pública que configuramos
    this.router.navigate([`/pqrs/${this.radicadoInput.trim().toUpperCase()}`]);
  }
}
