import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import Swal from 'sweetalert2';

import { Ciudadano } from 'src/app/models/Ciudadanos/ciudadano.model';
import { Direccion } from 'src/app/models/Direcciones/direccion.model';
import { MetodoPago } from 'src/app/models/MetodosPago/metodo-pago.model';
import { User } from 'src/app/models/Users/user.model';

import { CiudadanoService } from 'src/app/services/Ciudadano/ciudadano.service';
import { DireccionService } from 'src/app/services/Direccion/direccion.service';
import { MetodoPagoService } from 'src/app/services/MetodoPago/metodo-pago.service';
import { MetodoPagoCiudadanoService } from 'src/app/services/MetodosPagoCiudadano/metodo-pago-ciudadano.service';
import { UserService } from 'src/app/services/User/user.service';

@Component({
  selector: 'app-manage-ciudadanos',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss']
})
export class ManageComponent implements OnInit {

  mode: number = 1; // 1: view, 2: create, 3: update

  ciudadano: Ciudadano = {
    id: 0,
    usuarioId: '',
    direcciones: [],
    metodosPagoCiudadano: []
  };

  usuarios: User[] = [];
  metodosPago: MetodoPago[] = [];

  theFormGroup!: FormGroup;
  direccionForm!: FormGroup;
  metodoPagoCiudadanoForm!: FormGroup;

  trySend = false;

  mostrarModalDireccion = false;
  mostrarModalMetodoPago = false;

  direccionEditandoId?: number;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,

    private ciudadanoService: CiudadanoService,
    private direccionService: DireccionService,
    private metodoPagoService: MetodoPagoService,
    private metodoPagoCiudadanoService: MetodoPagoCiudadanoService,
    private userService: UserService
  ) {
    this.configFormGroup();
    this.configDireccionForm();
    this.configMetodoPagoCiudadanoForm();
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

    this.cargarUsuarios();
    this.cargarMetodosPago();

    const id = this.activatedRoute.snapshot.params['id'];

    if (id) {
      this.ciudadano.id = Number(id);
      this.getCiudadano(this.ciudadano.id);
    }

    if (this.mode === 1) {
      this.theFormGroup.disable();
    }

    if (this.mode === 3) {
      this.theFormGroup.get('usuarioId')?.disable();
    }
  }

  configFormGroup(): void {
    this.theFormGroup = this.fb.group({
      id: [{ value: '', disabled: true }],
      usuarioId: ['', [Validators.required]]
    });
  }

  configDireccionForm(): void {
    this.direccionForm = this.fb.group({
      pais: ['Colombia', [Validators.required]],
      ciudad: ['Manizales', [Validators.required]],
      barrio: ['', [Validators.required]],
      calle: ['', [Validators.required]],
      numero: ['', [Validators.required]],
      referencia: [''],
      codigoPostal: ['']
    });
  }

  configMetodoPagoCiudadanoForm(): void {
    this.metodoPagoCiudadanoForm = this.fb.group({
      metodoPagoId: ['', [Validators.required]],
      numeroIdentificacion: ['', [Validators.required]],
      saldo: [0, [Validators.required, Validators.min(0)]],
      activo: [true, [Validators.required]]
    });
  }

  get getTheFormGroup() {
    return this.theFormGroup.controls;
  }

  get getDireccionForm() {
    return this.direccionForm.controls;
  }

  get getMetodoPagoCiudadanoForm() {
    return this.metodoPagoCiudadanoForm.controls;
  }

  cargarUsuarios(): void {
    this.userService.list().subscribe({
      next: (data) => {
        this.usuarios = data;
      },
      error: (error) => {
        console.error('Error cargando usuarios:', error);

        Swal.fire(
          'Error',
          'No se pudieron cargar los usuarios.',
          'error'
        );
      }
    });
  }

  cargarMetodosPago(): void {
    this.metodoPagoService.list().subscribe({
      next: (data) => {
        this.metodosPago = data;
      },
      error: (error) => {
        console.error('Error cargando métodos de pago:', error);

        Swal.fire(
          'Error',
          'No se pudieron cargar los métodos de pago.',
          'error'
        );
      }
    });
  }

  getCiudadano(id: number): void {
    this.ciudadanoService.view(id).subscribe({
      next: (data) => {
        this.ciudadano = data;

        this.theFormGroup.patchValue({
          id: data.id,
          usuarioId: data.usuarioId
        });

        if (this.mode === 1) {
          this.theFormGroup.disable();
        }

        if (this.mode === 3) {
          this.theFormGroup.get('usuarioId')?.disable();
        }
      },
      error: (error) => {
        console.error('Error obteniendo ciudadano:', error);

        Swal.fire(
          'Error',
          'No se pudo obtener el ciudadano.',
          'error'
        );

        this.router.navigate(['/ciudadanos/list']);
      }
    });
  }

  getNombreUsuario(usuario: User): string {
    return (
      usuario.name ||
      usuario.email ||
      usuario.id ||
      'Usuario sin nombre'
    );
  }

  back(): void {
    this.router.navigate(['/ciudadanos/list']);
  }

  create(): void {
    this.trySend = true;

    if (this.theFormGroup.invalid) {
      this.theFormGroup.markAllAsTouched();

      Swal.fire(
        'Error!',
        'Por favor, seleccione un usuario.',
        'error'
      );

      return;
    }

    const usuarioId = this.theFormGroup.get('usuarioId')?.value;

    const nuevoCiudadano: Ciudadano = {
      usuarioId
    };

    this.ciudadanoService.create(nuevoCiudadano).subscribe({
      next: (data) => {
        Swal.fire(
          'Creado!',
          'Ciudadano creado correctamente. Ahora puede agregar direcciones y métodos de pago.',
          'success'
        );

        this.ciudadano = data;
        this.mode = 3;

        this.theFormGroup.patchValue({
          id: data.id,
          usuarioId: data.usuarioId
        });

        this.theFormGroup.get('usuarioId')?.disable();

        this.router.navigate(['/ciudadanos/update', data.id]);
      },
      error: (error) => {
        console.error('Error creando ciudadano:', error);

        Swal.fire(
          'Error',
          error.error?.message || 'No se pudo crear el ciudadano.',
          'error'
        );
      }
    });
  }

  update(): void {
    this.trySend = true;

    if (!this.ciudadano.id) {
      Swal.fire(
        'Error',
        'No se encontró el ID del ciudadano.',
        'error'
      );

      return;
    }

    /*
      En editar NO mandamos usuarioId porque no se puede cambiar.
      Solo se mantiene el ciudadano actual.
      Si luego agregas más campos editables al ciudadano, agrégalos aquí.
    */
    const ciudadanoActualizado: Ciudadano = {
      id: this.ciudadano.id,
      usuarioId: this.ciudadano.usuarioId
    };

    this.ciudadanoService.update(this.ciudadano.id, ciudadanoActualizado).subscribe({
      next: () => {
        Swal.fire(
          'Actualizado!',
          'Ciudadano actualizado correctamente.',
          'success'
        );

        this.getCiudadano(this.ciudadano.id!);
      },
      error: (error) => {
        console.error('Error actualizando ciudadano:', error);

        Swal.fire(
          'Error',
          error.error?.message || 'No se pudo actualizar el ciudadano.',
          'error'
        );
      }
    });
  }

  // ==========================
  // DIRECCIONES
  // ==========================

  abrirModalDireccion(): void {
    this.direccionEditandoId = undefined;

    this.direccionForm.reset({
      pais: 'Colombia',
      ciudad: 'Manizales',
      barrio: '',
      calle: '',
      numero: '',
      referencia: '',
      codigoPostal: ''
    });

    this.mostrarModalDireccion = true;
  }

  abrirModalEditarDireccion(direccion: Direccion): void {
    this.direccionEditandoId = direccion.id;

    this.direccionForm.patchValue({
      pais: direccion.pais,
      ciudad: direccion.ciudad,
      barrio: direccion.barrio,
      calle: direccion.calle,
      numero: direccion.numero,
      referencia: direccion.referencia,
      codigoPostal: direccion.codigoPostal
    });

    this.mostrarModalDireccion = true;
  }

  cerrarModalDireccion(): void {
    this.mostrarModalDireccion = false;
    this.direccionEditandoId = undefined;
  }

  guardarDireccion(): void {
    if (!this.ciudadano.id) {
      Swal.fire(
        'Error',
        'Primero debe guardar el ciudadano.',
        'error'
      );

      return;
    }

    if (this.direccionForm.invalid) {
      this.direccionForm.markAllAsTouched();

      Swal.fire(
        'Error!',
        'Por favor, complete los campos requeridos.',
        'error'
      );

      return;
    }

    const data = {
      ...this.direccionForm.value,
      ciudadanoId: this.ciudadano.id
    };

    const request = this.direccionEditandoId
      ? this.direccionService.update(this.direccionEditandoId, data)
      : this.direccionService.create(data);

    request.subscribe({
      next: () => {
        Swal.fire(
          'Guardado!',
          'Dirección guardada correctamente.',
          'success'
        );

        this.cerrarModalDireccion();
        this.getCiudadano(this.ciudadano.id!);
      },
      error: (error) => {
        console.error('Error guardando dirección:', error);

        Swal.fire(
          'Error',
          error.error?.message || 'No se pudo guardar la dirección.',
          'error'
        );
      }
    });
  }

  // ==========================
  // METODOS DE PAGO CIUDADANO
  // ==========================

  abrirModalMetodoPago(): void {
    this.metodoPagoCiudadanoForm.reset({
      metodoPagoId: '',
      numeroIdentificacion: '',
      saldo: 0,
      activo: true
    });

    this.mostrarModalMetodoPago = true;
  }

  cerrarModalMetodoPago(): void {
    this.mostrarModalMetodoPago = false;
  }

  guardarMetodoPagoCiudadano(): void {
    if (!this.ciudadano.id) {
      Swal.fire(
        'Error',
        'Primero debe guardar el ciudadano.',
        'error'
      );

      return;
    }

    if (this.metodoPagoCiudadanoForm.invalid) {
      this.metodoPagoCiudadanoForm.markAllAsTouched();

      Swal.fire(
        'Error!',
        'Por favor, complete los campos requeridos.',
        'error'
      );

      return;
    }

    const data = {
      numeroIdentificacion: this.metodoPagoCiudadanoForm.value.numeroIdentificacion,
      saldo: Number(this.metodoPagoCiudadanoForm.value.saldo),
      activo: this.metodoPagoCiudadanoForm.value.activo,
      ciudadanoId: this.ciudadano.id,
      metodoPagoId: Number(this.metodoPagoCiudadanoForm.value.metodoPagoId)
    };

    this.metodoPagoCiudadanoService.create(data).subscribe({
      next: () => {
        Swal.fire(
          'Guardado!',
          'Método de pago asociado correctamente.',
          'success'
        );

        this.cerrarModalMetodoPago();
        this.getCiudadano(this.ciudadano.id!);
      },
      error: (error) => {
        console.error('Error guardando método de pago ciudadano:', error);

        Swal.fire(
          'Error',
          error.error?.message || 'No se pudo asociar el método de pago.',
          'error'
        );
      }
    });
  }

  eliminarDireccion(id: number | undefined): void {
    if (!id) {
      Swal.fire(
        'Error',
        'No se encontró el ID de la dirección.',
        'error'
      );
      return;
    }

    Swal.fire({
      title: 'Eliminar dirección',
      text: '¿Está seguro de eliminar esta dirección?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.direccionService.delete(id).subscribe({
          next: () => {
            Swal.fire(
              'Eliminada!',
              'La dirección fue eliminada correctamente.',
              'success'
            );

            this.cerrarModalDireccion();

            if (this.ciudadano.id) {
              this.getCiudadano(this.ciudadano.id);
            }
          },
          error: (error) => {
            console.error('Error eliminando dirección:', error);

            Swal.fire(
              'Error',
              error.error?.message || 'No se pudo eliminar la dirección.',
              'error'
            );
          }
        });
      }
    });
  }
  eliminarMetodoPagoCiudadano(id: number | undefined): void {
    if (!id) {
      Swal.fire(
        'Error',
        'No se encontró el ID del método de pago.',
        'error'
      );
      return;
    }

    Swal.fire({
      title: 'Eliminar método de pago',
      text: '¿Está seguro de eliminar este método de pago del ciudadano?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.metodoPagoCiudadanoService.delete(id).subscribe({
          next: () => {
            Swal.fire(
              'Eliminado!',
              'El método de pago fue eliminado correctamente.',
              'success'
            );

            this.cerrarModalMetodoPago();

            if (this.ciudadano.id) {
              this.getCiudadano(this.ciudadano.id);
            }
          },
          error: (error) => {
            console.error('Error eliminando método de pago:', error);

            Swal.fire(
              'Error',
              error.error?.message || 'No se pudo eliminar el método de pago.',
              'error'
            );
          }
        });
      }
    });
  }
}
