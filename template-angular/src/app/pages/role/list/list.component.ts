import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Role } from '../../../models/Roles/role.model';
import { Permission } from '../../../models/Permissions/permission.model';
import { RolePermission } from '../../../models/RolePermission/role-permission.model';
import { RoleService } from '../../../services/Role/role.service';
import { PermissionService } from '../../../services/permission.service';
import { RolePermissionService } from '../../../services/Role permission.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html'
})
export class ListComponent implements OnInit {
  roles: Role[] = [];

  // Modal
  showModal = false;
  selectedRole: Role | null = null;
  allPermissions: Permission[] = [];
  assignedRolePermissions: RolePermission[] = [];
  loadingPermissions = false;

  constructor(
    private rolesService: RoleService,
    private permissionService: PermissionService,
    private rolePermissionService: RolePermissionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.list();
  }

  list() {
    this.rolesService.list().subscribe({
      next: (roles) => (this.roles = roles)
    });
  }

  create() { this.router.navigate(['/roles/create']); }
  view(id: string) { this.router.navigate(['/roles/view/' + id]); }
  edit(id: string) { this.router.navigate(['/roles/update/' + id]); }

  delete(id: string) {
    Swal.fire({
      title: 'Eliminar',
      text: '¿Está seguro que quiere eliminar el registro?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.rolesService.delete(id).subscribe({
          next: (response) => {
            console.log('Delete response:', response);
            Swal.fire('Eliminado!', 'Registro eliminado correctamente.', 'success');
            this.list();
          },
          error: (err) => {
            console.error('Error deleting role:', err);
            if (err.status === 409) {
              Swal.fire('No permitido', 'No se puede eliminar el rol porque tiene usuarios asignados.', 'warning');
            } else {
              Swal.fire('Error', err.error || 'Ocurrió un error al eliminar.', 'error');
            }
          }
        });
      }
    });
  }

  // ─── Modal de permisos ───────────────────────────────────────────

  openPermissionsModal(role: Role) {
    this.selectedRole = role;
    this.showModal = true;
    this.loadingPermissions = true;

    // Carga todos los permisos y los ya asignados al rol en paralelo
    this.permissionService.list().subscribe({
      next: (all) => {
        this.allPermissions = all;
        this.rolePermissionService.getByRole(role.id!).subscribe({
          next: (assigned) => {
            this.assignedRolePermissions = assigned;
            this.loadingPermissions = false;
          },
          error: () => (this.loadingPermissions = false)
        });
      },
      error: () => (this.loadingPermissions = false)
    });
  }

  closeModal() {
    this.showModal = false;
    this.selectedRole = null;
    this.allPermissions = [];
    this.assignedRolePermissions = [];
  }

  isAssigned(permissionId: string): boolean {
    return this.assignedRolePermissions.some(
      (rp) => rp.permission?.id === permissionId
    );
  }

  getRolePermissionId(permissionId: string): string | undefined {
    return this.assignedRolePermissions.find(
      (rp) => rp.permission?.id === permissionId
    )?.id;
  }

  togglePermission(permissionId: string) {
    if (!this.selectedRole?.id) return;

    if (this.isAssigned(permissionId)) {
      const rpId = this.getRolePermissionId(permissionId);
      if (!rpId) return;
      this.rolePermissionService.remove(rpId).subscribe({
        next: () => {
          this.assignedRolePermissions = this.assignedRolePermissions.filter(
            (rp) => rp.id !== rpId
          );
        },
        error: () => Swal.fire('Error', 'No se pudo quitar el permiso.', 'error')
      });
    } else {
      this.rolePermissionService.add(this.selectedRole.id!, permissionId).subscribe({
        next: (response: any) => {
          // Recarga los permisos asignados para obtener el nuevo id del RolePermission
          this.rolePermissionService.getByRole(this.selectedRole!.id!).subscribe({
            next: (assigned) => (this.assignedRolePermissions = assigned)
          });
        },
        error: () => Swal.fire('Error', 'No se pudo asignar el permiso.', 'error')
      });
    }
  }
}
