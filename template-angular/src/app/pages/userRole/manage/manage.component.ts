import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Role } from '../../../models/Roles/role.model';
import { User } from '../../../models/Users/user.model';
import { UserRole } from '../../../models/UsersRoles/user-role.model';
import { RoleService } from '../../../services/Role/role.service';
import { UserService } from '../../../services/User/user.service';
import { UserRoleService } from '../../../services/UserRole/user-role.service';


@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
})
export class ManageComponent implements OnInit {
  mode: number; // 1: view, 2: create, 3: update
  userRole: UserRole;
  users: User[] = []; // Lista de usuarios
  roles: Role[] = []; // Lista de roles
  theFormGroup: FormGroup; // Policía de formulario
  trySend: boolean;
  constructor(
    private activatedRoute: ActivatedRoute,
    private usersRolesService: UserRoleService,
    private router: Router,
    private theFormBuilder: FormBuilder,
    private userService: UserService,
    private roleService: RoleService
  ) {
    this.trySend = false;
    this.userRole = { id: '', user: null, role: null};
    this.configFormGroup()
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
    const currentUrl = this.activatedRoute.snapshot.url.join('/');
    if (currentUrl.includes('view')) {
      this.mode = 1;
    } else if (currentUrl.includes('create')) {
      this.mode = 2;
    } else if (currentUrl.includes('update')) {
      this.mode = 3;
    }
    if (this.mode === 1) {
      this.theFormGroup.disable();
    }
    if (this.activatedRoute.snapshot.params.id) {
      this.userRole.id = this.activatedRoute.snapshot.params.id;
      this.getUserRole(this.userRole.id); // Pasar como string
    }

  }
  loadUsers() {
    this.userService.list().subscribe({
      next: (users) => { this.users = users; },
      error: (err) => { this.users = []; }
    });
  }

  loadRoles() {
    this.roleService.list().subscribe({
      next: (roles) => { this.roles = roles; },
      error: (err) => { this.roles = []; }
    });
  }

  configFormGroup() {
    this.theFormGroup = this.theFormBuilder.group({
      id: ['', []], // Cambiado a string vacío por defecto
      user: [null, [Validators.required]], // null por defecto
      role: [null, [Validators.required]], // null por defecto
    })
  }


  get getTheFormGroup() {
    return this.theFormGroup.controls
  }

  getUserRole(id: string) {
    this.usersRolesService.view(id).subscribe({
      next: (response) => {
        this.userRole = response;
        this.theFormGroup.patchValue({
          id: this.userRole.id,
          user: this.userRole.user?.id,
          role: this.userRole.role?.id,
          });
        console.log('role fetched successfully:', this.userRole);
      },
      error: (error) => {
        console.error('Error fetching role:', error);
      }
    });
  }
  back() {
    this.router.navigate(['/user-role/list']);
  }

  create() {
    this.trySend = true;
    if (this.theFormGroup.invalid) {
      Swal.fire({
        title: 'Error!',
        text: 'Por favor, complete todos los campos requeridos.',
        icon: 'error',
      })
      return;
    }
      const formValue = this.theFormGroup.value;
      const profileToSend = {
        user: { id: formValue.user },
        role: { id: formValue.role }};
    this.usersRolesService.create(profileToSend).subscribe({
      next: (role) => {
        console.log('role created successfully:', role);
        Swal.fire({
          title: 'Creado!',
          text: 'Registro creado correctamente.',
          icon: 'success',
        })
        this.router.navigate(['/user-role/list']);
      },
      error: (error) => {
        console.error('Error creating role:', error);
      }
    });
  }
  update() {
    this.trySend = true;
    if (this.theFormGroup.invalid) {
      Swal.fire({
        title: 'Error!',
        text: 'Por favor, complete todos los campos requeridos.',
        icon: 'error',
      })
      return;
    }
      const formValue = this.theFormGroup.value;
      const profileToSend = {
        id: this.userRole.id,
        user: { id: formValue.user },
        role: { id: formValue.role }
      };

    this.usersRolesService.update(profileToSend).subscribe({
      next: (userRole) => {
        console.log('Role updated successfully:', userRole);
        Swal.fire({
          title: 'Actualizado!',
          text: 'Registro actualizado correctamente.',
          icon: 'success',
        })
        this.router.navigate(['/user-role/list']);
      },
      error: (error) => {
        console.error('Error updating role:', error);
      }
    });
  }

}
