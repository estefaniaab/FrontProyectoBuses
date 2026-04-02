import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Role } from '../../../models/Roles/role.model';
import { RoleService } from '../../../services/Role/role.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
})
export class ManageComponent implements OnInit {
  mode: number; // 1: view, 2: create, 3: update
  role: Role;
  theFormGroup: FormGroup; // Policía de formulario
  trySend: boolean;
  constructor(private activatedRoute: ActivatedRoute,
    private rolesService: RoleService,
    private router: Router,
    private theFormBuilder: FormBuilder //Definir las reglas
  ) {
    this.trySend = false;
    this.role = { id: '', name: '', description: ''};
    this.configFormGroup()
  }

  ngOnInit(): void {
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
      this.role.id = this.activatedRoute.snapshot.params.id
      this.getRole(this.role.id)
    }

  }
  configFormGroup() {
    this.theFormGroup = this.theFormBuilder.group({
      // primer elemento del vector, valor por defecto
      // lista, serán las reglas
      id: ['',[]],
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      description: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
        })
  }


  get getTheFormGroup() {
    return this.theFormGroup.controls
  }

  getRole(id: string) {
    this.rolesService.view(id).subscribe({
      next: (response) => {
        this.role = response;

        this.theFormGroup.patchValue({
          id: this.role.id,
          name: this.role.name,
          description: this.role.description,

        });

        console.log('role fetched successfully:', this.role);
      },
      error: (error) => {
        console.error('Error fetching role:', error);
      }
    });
  }
  back() {
    this.router.navigate(['/roles/list']);
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
    this.rolesService.create(this.theFormGroup.value).subscribe({
      next: (role) => {
        console.log('role created successfully:', role);
        Swal.fire({
          title: 'Creado!',
          text: 'Registro creado correctamente.',
          icon: 'success',
        })
        this.router.navigate(['/roles/list']);
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
    this.rolesService.update(this.theFormGroup.value).subscribe({
      next: (role) => {
        console.log('Role updated successfully:', role);
        Swal.fire({
          title: 'Actualizado!',
          text: 'Registro actualizado correctamente.',
          icon: 'success',
        })
        this.router.navigate(['/roles/list']);
      },
      error: (error) => {
        console.error('Error updating role:', error);
      }
    });
  }

}
