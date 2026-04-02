import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Role } from '../../../models/Roles/role.model';
import { RoleService } from '../../../services/Role/role.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
})
export class ListComponent implements OnInit {
  roles: Role[] = [];
  constructor(private rolesService:RoleService,
    private router:Router
  ) { }

  ngOnInit(): void {
    this.list();
  }

  list(){
    this.rolesService.list().subscribe({
      next: (roles) => {
        this.roles = roles;
      }
    });
  }
  create(){
    this.router.navigate(['/roles/create']);
  }
  view(id:string){
    this.router.navigate(['/roles/view/'+id]);
  }
  edit(id:string){
    this.router.navigate(['/roles/update/'+id]);
  }
  delete(id:string){
    console.log("Delete role with id:", id);
    Swal.fire({
      title: 'Eliminar',
      text: "Está seguro que quiere eliminar el registro?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.rolesService.delete(id).subscribe({  // ✅ objeto con {}
          next: () => {
            Swal.fire('Eliminado!', 'Registro eliminado correctamente.', 'success');
            this.ngOnInit();
          },
          error: (err) => {
            console.log('Status:', err.status);      // ✅ agrega esto
              console.log('Error completo:', err);
            if (err.status === 409) {
              Swal.fire('No permitido', 'No se puede eliminar el rol porque tiene usuarios asignados.', 'warning');
            } else {
              Swal.fire('Error', 'Ocurrió un error al eliminar.', 'error');
            }
          }
        });
      }
    });
  }
}
