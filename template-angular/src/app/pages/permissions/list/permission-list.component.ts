import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Permission } from '../../../models/Permissions/permission.model';
import { PermissionService } from '../../../services/permission.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-permission-list',
  templateUrl: './permission-list.component.html'
})
export class PermissionListComponent implements OnInit {
  permissions: Permission[] = [];

  constructor(
    private permissionService: PermissionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.list();
  }

  list() {
    this.permissionService.list().subscribe({
      next: (data) => (this.permissions = data)
    });
  }

  create() {
    this.router.navigate(['/permissions/create']);
  }

  view(id: string) {
    this.router.navigate(['/permissions/view/' + id]);
  }

  edit(id: string) {
    this.router.navigate(['/permissions/update/' + id]);
  }

  delete(id: string) {
    Swal.fire({
      title: 'Eliminar',
      text: '¿Está seguro que quiere eliminar este permiso?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.permissionService.delete(id).subscribe({
          next: () => {
            Swal.fire('Eliminado!', 'Permiso eliminado correctamente.', 'success');
            this.list();
          },
          error: () => Swal.fire('Error', 'Ocurrió un error al eliminar.', 'error')
        });
      }
    });
  }
}
