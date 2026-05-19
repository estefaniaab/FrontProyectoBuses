import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ConductoresService } from 'src/app/services/Conductores/conductores.service';
import { EmpresaService } from 'src/app/services/Empresas/empresa.service';
import { User } from 'src/app/models/Users/user.model';
import { Empresa } from 'src/app/models/Empresas/empresa.model';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss']
})
export class ManageComponent implements OnInit {
  form: FormGroup;
  id?: number;
  isEdit = false;
  isView = false;
  users: User[] = [];
  empresas: Empresa[] = [];

  constructor(
    private fb: FormBuilder,
    private service: ConductoresService,
    private empresaService: EmpresaService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      userId: [null, [Validators.required]],
      licencia: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(20)
      ]],
      fechaVencimientoLicencia: [null],
      telefono: ['', [Validators.maxLength(20)]],
      activo: [true],
      empresaId: [null, [Validators.required]]
    });
  }

  ngOnInit(): void {
    const url = this.route.snapshot.url.join('/');
    this.id = this.route.snapshot.params['id'];

    this.getUsers();
    this.cargarEmpresas();

    if (this.id) {
      if (url.includes('view')) {
        this.isView = true;
        this.form.disable();
      } else if (url.includes('update')) {
        this.isEdit = true;
      }

      this.loadDriver();
    }
  }

  getUsers(): void {
    this.service.getUsers().subscribe({
      next: (data) => {
        this.users = data;
      },
      error: (err) => {
        console.error('Error al cargar usuarios de seguridad', err);
      }
    });
  }

  cargarEmpresas(): void {
    this.empresaService.list().subscribe({
      next: (data) => {
        this.empresas = data.filter(empresa => empresa.activo !== false);
      },
      error: (err) => {
        console.error('Error al cargar empresas', err);
      }
    });
  }

  loadDriver(): void {
    this.service.view(this.id!).subscribe({
      next: (data) => {
        if (data.fechaVencimientoLicencia) {
          data.fechaVencimientoLicencia = new Date(data.fechaVencimientoLicencia)
            .toISOString()
            .substring(0, 10);
        }

        this.form.patchValue({
          userId: data.userId,
          licencia: data.licencia,
          fechaVencimientoLicencia: data.fechaVencimientoLicencia,
          telefono: data.telefono,
          activo: data.activo,
          empresaId: data.empresaId || data.empresa?.id || null
        });

        if (this.isView) {
          this.form.disable();
        }
      },
      error: (err) => {
        console.error('Error cargando conductor:', err);

        Swal.fire(
          'Error',
          err.error?.message || 'No se pudo cargar el conductor.',
          'error'
        );

        this.router.navigate(['/conductores/list']);
      }
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      Swal.fire(
        'Formulario inválido',
        'Complete los campos requeridos.',
        'warning'
      );

      return;
    }

    const data = this.form.getRawValue();

    const request = this.isEdit
      ? this.service.update({ ...data, id: this.id })
      : this.service.create(data);

    request.subscribe({
      next: () => {
        Swal.fire(
          this.isEdit ? 'Actualizado' : 'Creado',
          this.isEdit
            ? 'Conductor actualizado correctamente.'
            : 'Conductor creado correctamente.',
          'success'
        );

        this.router.navigate(['/conductores/list']);
      },
      error: (err) => {
        const message = err.error?.message || 'Error al guardar el conductor';

        Swal.fire(
          'Error',
          Array.isArray(message) ? message.join(', ') : message,
          'error'
        );
      }
    });
  }
}
