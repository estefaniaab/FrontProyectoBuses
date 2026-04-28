import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Permission } from '../../../models/Permissions/permission.model';
import { PermissionService } from '../../../services/permission.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-permission-manage',
  templateUrl: './permission-manage.component.html'
})
export class PermissionManageComponent implements OnInit {
  form: FormGroup;
  mode: 'create' | 'view' | 'update' = 'create';
  permissionId: string | null = null;
  methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

  constructor(
    private fb: FormBuilder,
    private permissionService: PermissionService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      url:    ['', Validators.required],
      method: ['', Validators.required],
      model:  ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const url = this.router.url;
    this.permissionId = this.route.snapshot.paramMap.get('id');

    if (url.includes('view')) {
      this.mode = 'view';
      this.form.disable();
    } else if (url.includes('update')) {
      this.mode = 'update';
    }

    if (this.permissionId) {
      this.permissionService.findById(this.permissionId).subscribe({
        next: (p) => this.form.patchValue(p)
      });
    }
  }

  get isReadOnly() { return this.mode === 'view'; }

  save() {
    if (this.form.invalid) return;

    const data: Permission = this.form.value;

    if (this.mode === 'create') {
      this.permissionService.create(data).subscribe({
        next: () => {
          Swal.fire('Creado', 'Permiso creado correctamente.', 'success');
          this.router.navigate(['/permissions/list']);
        },
        error: () => Swal.fire('Error', 'No se pudo crear el permiso.', 'error')
      });
    } else if (this.mode === 'update') {
      this.permissionService.update(this.permissionId!, data).subscribe({
        next: () => {
          Swal.fire('Actualizado', 'Permiso actualizado correctamente.', 'success');
          this.router.navigate(['/permissions/list']);
        },
        error: () => Swal.fire('Error', 'No se pudo actualizar el permiso.', 'error')
      });
    }
  }

  cancel() {
    this.router.navigate(['/permissions/list']);
  }
}
