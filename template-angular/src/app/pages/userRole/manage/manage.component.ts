import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Role } from '../../../models/Roles/role.model';
import { User } from '../../../models/Users/user.model';
import { RoleService } from '../../../services/Role/role.service';
import { UserService } from '../../../services/User/user.service';
import { UserRoleService } from '../../../services/UserRole/user-role.service';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
})
export class ManageComponent implements OnInit {
  mode: number; // 1: view, 2: create, 3: update
  users: User[] = [];
  roles: Role[] = [];
  theFormGroup: FormGroup;
  trySend: boolean;
  selectedUserId: string = '';
  searchText: string = '';
  filteredUsers: User[] = [];
  showUserOptions: boolean = false;
  returnTo: string = 'user-role-list';

  constructor(
    private activatedRoute: ActivatedRoute,
    private usersRolesService: UserRoleService,
    private router: Router,
    private theFormBuilder: FormBuilder,
    private userService: UserService,
    private roleService: RoleService
  ) {
    this.trySend = false;
    this.configFormGroup();
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
    const returnTo = this.activatedRoute.snapshot.queryParams['returnTo'];
    if (returnTo) {
        this.returnTo = returnTo;
    }

    if (this.activatedRoute.snapshot.params.id) {
      this.selectedUserId = this.activatedRoute.snapshot.params.id;
      this.getUserRole(this.selectedUserId);
    }

    if (this.mode === 1) {
      this.theFormGroup.disable();
    }
  }

  loadUsers(): void {
    this.userService.list().subscribe({
      next: (users) => {
        this.users = users || [];
        this.filteredUsers = this.users;
      },
      error: () => {
        this.users = [];
        this.filteredUsers = [];
      }
    });
  }

  loadRoles(): void {
    this.roleService.list().subscribe({
      next: (roles) => { this.roles = roles; },
      error: () => { this.roles = []; }
    });
  }

  onUserInputFocus(): void {
    if (this.mode !== 2) return;
    this.filteredUsers = this.users;
    this.showUserOptions = true;
  }

  filterUsers(): void {
    const value = (this.searchText || '').toLowerCase().trim();

    if (!value) {
      this.filteredUsers = this.users;
      this.showUserOptions = true;
      return;
    }

    this.filteredUsers = this.users.filter(user =>
      (user.name || '').toLowerCase().includes(value) ||
      (user.email || '').toLowerCase().includes(value)
    );

    this.showUserOptions = true;
  }

  selectUser(user: User): void {
    this.theFormGroup.patchValue({
      userId: user.id
    });

    this.searchText = `${user.name} - ${user.email}`;
    this.showUserOptions = false;
  }

  hideUserOptions(): void {
    setTimeout(() => {
      this.showUserOptions = false;
    }, 200);
  }

  configFormGroup(): void {
    this.theFormGroup = this.theFormBuilder.group({
      userId: ['', [Validators.required]],
      roleIds: [[]]
    });
  }

  get getTheFormGroup() {
    return this.theFormGroup.controls;
  }

  getUserRole(userId: string): void {
    this.usersRolesService.view(userId).subscribe({
      next: (response) => {
        this.theFormGroup.patchValue({
          userId: response.user?.id,
          roleIds: response.roles ? response.roles.map((role: any) => role.id) : []
        });

        if (response.user) {
          this.searchText = `${response.user.name} - ${response.user.email}`;
        }
      },
      error: (error) => {
        console.error('Error fetching grouped user roles:', error);
      }
    });
  }

  back(): void {
    if (this.returnTo === 'users-list') {
      this.router.navigate(['/users/list']);
    } else {
      this.router.navigate(['/user-role/list']);
    }
  }

  isChecked(roleId: string): boolean {
    const selectedRoles = this.theFormGroup.getRawValue().roleIds || [];
    return selectedRoles.includes(roleId);
  }

  onRoleChange(roleId: string, event: any): void {
    const selectedRoles: string[] = [...(this.theFormGroup.getRawValue().roleIds || [])];

    if (event.target.checked) {
      if (!selectedRoles.includes(roleId)) {
        selectedRoles.push(roleId);
      }
    } else {
      const index = selectedRoles.indexOf(roleId);
      if (index >= 0) {
        selectedRoles.splice(index, 1);
      }
    }

    this.theFormGroup.patchValue({
      roleIds: selectedRoles
    });
  }

  create(): void {
    this.trySend = true;

    if (this.theFormGroup.invalid) {
      Swal.fire({
        title: 'Error!',
        text: 'Por favor, complete todos los campos requeridos.',
        icon: 'error',
      });
      return;
    }

    const formValue = this.theFormGroup.getRawValue();

    this.usersRolesService.create(formValue.userId, formValue.roleIds || []).subscribe({
      next: (response) => {
        Swal.fire({
          title: 'Creado!',
          text: response?.emailSent
            ? 'Registro creado correctamente. Se notificó al usuario del cambio de roles.'
            : 'Registro creado correctamente.',
          icon: 'success',
        });
        this.router.navigate(['/user-role/list']);
      },
      error: (error) => {
        console.error('Error creating grouped user roles:', error);
        Swal.fire({
          title: 'Error!',
          text: 'No se pudo crear el registro.',
          icon: 'error',
        });
      }
    });
  }

  update(): void {
    this.trySend = true;

    if (this.theFormGroup.invalid) {
      Swal.fire({
        title: 'Error!',
        text: 'Por favor, complete todos los campos requeridos.',
        icon: 'error',
      });
      return;
    }

    const formValue = this.theFormGroup.getRawValue();

    this.usersRolesService.update(formValue.userId, formValue.roleIds || []).subscribe({
      next: (response) => {
        Swal.fire({
          title: 'Actualizado!',
          text: response?.emailSent
            ? 'Registro actualizado correctamente. Se notificó al usuario del cambio de roles.'
            : 'Registro actualizado correctamente.',
          icon: 'success',
        });
        if (this.returnTo !== 'users-list') {
          this.router.navigate(['/user-role/list']);
        }
      },
      error: (error) => {
        console.error('Error updating grouped user roles:', error);
        Swal.fire({
          title: 'Error!',
          text: 'No se pudo actualizar el registro.',
          icon: 'error',
        });
      }
    });
  }
}
