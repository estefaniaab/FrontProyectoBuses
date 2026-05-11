import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Bus } from '../../../models/Buses/bus.model';
import { BusService } from '../../../services/Bus/bus.service';
import { EstadoBus } from '../../../models/Buses/estado-bus.enum';

@Component({
  selector: 'app-manage-buses',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss']
})
export class ManageComponent implements OnInit {
  mode!: number; // 1: view, 2: create, 3: update
  bus!: Bus;
  theFormGroup!: FormGroup;
  trySend: boolean;
  photoPreview: string | null = null;

  estadosBus = [
    { value: EstadoBus.OPERATIVO, label: 'Operativo' },
    { value: EstadoBus.MANTENIMIENTO, label: 'Mantenimiento' },
    { value: EstadoBus.FUERA_DE_SERVICIO, label: 'Fuera de servicio' },
  ];

  constructor(
    private activatedRoute: ActivatedRoute,
    private busesService: BusService,
    private router: Router,
    private theFormBuilder: FormBuilder
  ) {
    this.trySend = false;

    this.bus = {
      id: 0,
      placa: '',
      modelo: '',
      anio: 0,
      capacidadMaximaPasajeros: 0,
      capacidadSentados: 0,
      capacidadParados: 0,
      estado: EstadoBus.OPERATIVO,
      fotoUrl: '',
      codigoQr: ''
    };

    this.configFormGroup();
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
      this.bus.id = Number(this.activatedRoute.snapshot.params.id);
      this.getBus(this.bus.id);
    }
  }

  configFormGroup() {
    this.theFormGroup = this.theFormBuilder.group({
      id: [0, []],
      placa: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(10)]],
      modelo: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      anio: [0, [Validators.required, Validators.min(1990), Validators.max(2030)]],
      capacidadMaximaPasajeros: [0, [Validators.required, Validators.min(1), Validators.max(200)]],
      capacidadSentados: [0, [Validators.required, Validators.min(0), Validators.max(200)]],
      capacidadParados: [0, [Validators.required, Validators.min(0), Validators.max(200)]],
      estado: [EstadoBus.OPERATIVO, [Validators.required]],
      fotoUrl: ['', []],
      codigoQr: ['', []],
    });
  }

  get getTheFormGroup() {
    return this.theFormGroup.controls;
  }

  getBus(id: number) {
    this.busesService.view(id).subscribe({
      next: (response) => {
        this.bus = response;

        this.theFormGroup.patchValue({
          id: this.bus.id,
          placa: this.bus.placa,
          modelo: this.bus.modelo,
          anio: Number(this.bus.anio),
          capacidadMaximaPasajeros: Number(this.bus.capacidadMaximaPasajeros),
          capacidadSentados: Number(this.bus.capacidadSentados),
          capacidadParados: Number(this.bus.capacidadParados),
          estado: this.bus.estado,
          fotoUrl: this.bus.fotoUrl,
          codigoQr: this.bus.codigoQr,
        });
        if (this.bus.fotoUrl) {
          this.photoPreview = this.bus.fotoUrl;
        }
      },
      error: (error) => {
        console.error('Error fetching bus:', error);
      }
    });
  }

  back() {
    this.router.navigate(['/buses/list']);
  }

  create() {
    this.trySend = true;

    if (this.theFormGroup.invalid) {
      Swal.fire({
        title: 'Error!',
        text: 'Por favor, complete todos los campos requeridos.',
        icon: 'error',
      });
      return;
    }

    this.busesService.create(this.theFormGroup.value).subscribe({
      next: (bus) => {
        console.log('bus created successfully:', bus);

        Swal.fire({
          title: 'Creado!',
          text: 'Registro creado correctamente.',
          icon: 'success',
        });

        this.router.navigate(['/buses/list']);
      },
      error: (error) => {
        console.error('Error creating bus:', error);
        Swal.fire({
          title: 'Error!',
          text: error.error?.message || 'No se pudo crear el bus.',
          icon: 'error',
        });
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
      });
      return;
    }

    this.busesService.update(this.theFormGroup.value).subscribe({
      next: (bus) => {
        console.log('bus updated successfully:', bus);

        Swal.fire({
          title: 'Actualizado!',
          text: 'Registro actualizado correctamente.',
          icon: 'success',
        });

        this.router.navigate(['/buses/list']);
      },
      error: (error) => {
        console.error('Error updating bus:', error);
        Swal.fire({
          title: 'Error!',
          text: error.error?.message || 'No se pudo actualizar el bus.',
          icon: 'error',
        });
      }
    });
  }
  onFileSelected(event: any): void {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    const maxSize = 2 * 1024 * 1024; // 2 MB

    if (file.size > maxSize) {
      Swal.fire({
        title: 'Imagen muy grande',
        text: 'La imagen no debe superar los 2 MB.',
        icon: 'warning',
      });
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const base64 = reader.result as string;

      this.photoPreview = base64;

      this.theFormGroup.get('fotoUrl')?.setValue(base64);
      this.theFormGroup.get('fotoUrl')?.updateValueAndValidity();
    };

    reader.readAsDataURL(file);
  }
}
