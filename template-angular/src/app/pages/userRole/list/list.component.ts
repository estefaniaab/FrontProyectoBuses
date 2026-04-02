import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Role } from '../../../models/Roles/role.model';
import { User } from '../../../models/Users/user.model';
import { UserRole } from '../../../models/UsersRoles/user-role.model';
import { RoleService } from '../../../services/Role/role.service';
import { UserService } from '../../../services/User/user.service';
import { UserRoleService } from '../../../services/UserRole/user-role.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
})
export class ListComponent implements OnInit {
  usersRoles: UserRole[] = [];
  users: User[] = [];
  roles: Role[] = [];
  constructor(
    private usersRolesService: UserRoleService,
    private userService: UserService,
    private roleService: RoleService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
    this.list();
  }

  loadUsers() {
    this.userService.list().subscribe({
      next: (users) => { this.users = users; },
      error: () => { this.users = []; }
    });
  }

  loadRoles() {
    this.roleService.list().subscribe({
      next: (roles) => { this.roles = roles; },
      error: () => { this.roles = []; }
    });
  }

  list(){
    this.usersRolesService.list().subscribe({
      next: (usersRoles) => {
        this.usersRoles = usersRoles;
      }
    });
  }
  create(){
    this.router.navigate(['/user-role/create']);
  }
  view(id:string){
    this.router.navigate(['/user-role/view/'+id]);
  }
  edit(id:string){
    this.router.navigate(['/user-role/update/'+id]);
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
        this.usersRolesService.delete(id).
          subscribe(data => {
            Swal.fire(
              'Eliminado!',
              'Registro eliminado correctamente.',
              'success'
            )
            this.ngOnInit();
          });
      }
    })
  }

  getUserName(user: any): string {
      return user ? user.name : 'Sin usuario';
    }

  getRoleName(role: any): string {
    return role ? role.name : 'Sin usuario';
  }

}
