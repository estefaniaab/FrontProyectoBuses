import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

import { PqrsService } from 'src/app/services/Pqrs/pqrs.service';
import { UserService } from 'src/app/services/User/user.service';

@Component({
  selector: 'app-admin-detalle-pqrs',
  templateUrl: './admin-detalle-pqrs.component.html',
  styleUrls: ['./admin-detalle-pqrs.component.scss']
})
export class AdminDetallePqrsComponent implements OnInit {

  usuarioId!: string;
  pqrsList: any[] = [];
  nombreUsuario = 'Cargando...';
  returnUrl = '/pqrs/admin';

  constructor(
    private pqrsService: PqrsService,
    private userService: UserService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.returnUrl = history.state?.returnUrl || '/pqrs/admin';
    this.usuarioId = this.activatedRoute.snapshot.params['usuarioId'];
    this.cargarPQRSUsuario();
    this.cargarNombreUsuario();
  }

  cargarPQRSUsuario(): void {
    this.pqrsService.findByUsuario(this.usuarioId).subscribe({
      next: (data) => {
        this.pqrsList = data;
      },
      error: (error) => {
        console.error('Error cargando PQRS del usuario:', error);
        Swal.fire('Error', 'No se pudo cargar el historial de PQRS.', 'error');
      }
    });
  }

  cargarNombreUsuario(): void {
    this.userService.view(this.usuarioId).subscribe({
      next: (usuario: any) => {
        this.nombreUsuario = usuario?.name || usuario?.username || usuario?.email || this.usuarioId;
      },
      error: () => {
        this.nombreUsuario = this.usuarioId;
      }
    });
  }

  // 🟢 Dentro de tu admin-detalle-pqrs.component.ts

  view(radicado: string): void {
    if (!radicado) return;
    // Te redirige a la ruta privada de solo lectura
    this.router.navigate([`/pqrs/admin/ver/${radicado}`]);
  }

  edit(radicado: string): void {
    if (!radicado) return;
    // Te redirige a la ruta privada que activa el formulario de edición
    this.router.navigate([`/pqrs/admin/editar/${radicado}`]);
  }

  delete(id: number): void {
    if (!id) {
      Swal.fire('Error', 'No se puede eliminar este registro porque carece de un ID válido.', 'error');
      return;
    }

    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el PQRS de forma permanente en el sistema.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.pqrsService.delete(id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'El PQRS ha sido eliminado correctamente.', 'success');
            this.cargarPQRSUsuario();
          },
          error: (error) => {
            Swal.fire('Error', error.error?.message || 'No se pudo eliminar el PQRS.', 'error');
          }
        });
      }
    });
  }

  crearNuevoPQRS(): void {
    this.router.navigate(['/pqrs']);
  }

  back(): void {
    this.router.navigateByUrl(this.returnUrl);
  }
}
