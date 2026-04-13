import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { UserRoleService } from '../../../services/UserRole/user-role.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
})
export class ListComponent implements OnInit {
  usersRoles: any[] = [];

  constructor(
    private usersRolesService: UserRoleService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.list();
  }

  list(): void {
    this.usersRolesService.list().subscribe({
      next: (data) => {
        this.usersRoles = data;
      },
      error: (error) => {
        console.error(error);
        this.usersRoles = [];
      }
    });
  }

  create(): void {
    this.router.navigate(['/user-role/create'], {
      queryParams: { returnTo: 'user-role-list' }
    });
  }

  view(userId: string): void {
    this.router.navigate(['/user-role/view', userId], {
      queryParams: { returnTo: 'user-role-list' }
    });
  }

  edit(userId: string): void {
    this.router.navigate(['/user-role/update', userId], {
      queryParams: { returnTo: 'user-role-list' }
    });
  }

  delete(userId: string): void {
    Swal.fire({
      title: 'Eliminar',
      text: 'Está seguro que quiere eliminar todos los roles del usuario?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.usersRolesService.delete(userId).subscribe({
          next: () => {
            Swal.fire(
              'Eliminado!',
              'Roles eliminados correctamente.',
              'success'
            );
            this.list();
          },
          error: (error) => {
            console.error(error);
          }
        });
      }
    });
  }

  getRoleNames(roles: any[]): string {
    if (!roles || roles.length === 0) return 'Sin roles';
    return roles.map(role => role.name).join(', ');
  }
}
