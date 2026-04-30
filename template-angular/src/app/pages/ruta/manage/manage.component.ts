import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Ruta } from '../../../models/Rutas/ruta.model';
import { RutaService } from '../../../services/Ruta/ruta.service';

@Component({
  selector: 'app-manage-rutas',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss']
})
export class ManageComponent implements OnInit {
  mode: number; // 1: view, 2: create, 3: update
  ruta: Ruta;
  theFormGroup: FormGroup;
  trySend: boolean;

  constructor(
    private activatedRoute: ActivatedRoute,
    private rutasService: RutaService,
    private router: Router,
    private theFormBuilder: FormBuilder
  ) {
    this.trySend = false;
    this.ruta = {
      id: 0,
      nombre: '',
      descripcion: '',
      tarifa: 0,
      tiempoEstimadoTotal: 0
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
      this.ruta.id = this.activatedRoute.snapshot.params.id;
      this.getRuta(this.ruta.id);
    }
  }

  configFormGroup() {
    this.theFormGroup = this.theFormBuilder.group({
      id: [0, []],
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      descripcion: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      tarifa: [0, [Validators.required, Validators.min(0)]],
      tiempoEstimadoTotal: [0, [Validators.required, Validators.min(1)]],
    });
  }

  get getTheFormGroup() {
    return this.theFormGroup.controls;
  }

  getRuta(id: number) {
    this.rutasService.view(id).subscribe({
      next: (response) => {
        this.ruta = response;

        this.theFormGroup.patchValue({
          id: this.ruta.id,
          nombre: this.ruta.nombre,
          descripcion: this.ruta.descripcion,
          tarifa: Number(this.ruta.tarifa),
          tiempoEstimadoTotal: Number(this.ruta.tiempoEstimadoTotal),
        });
      },
      error: (error) => {
        console.error('Error fetching ruta:', error);
      }
    });
  }

  back() {
    this.router.navigate(['/rutas/list']);
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

    this.rutasService.create(this.theFormGroup.value).subscribe({
      next: (ruta) => {
        console.log('ruta created successfully:', ruta);

        Swal.fire({
          title: 'Creado!',
          text: 'Registro creado correctamente.',
          icon: 'success',
        });

        this.router.navigate(['/rutas/list']);
      },
      error: (error) => {
        console.error('Error creating ruta:', error);
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
  console.log(this.theFormGroup.value);
  console.log(typeof this.theFormGroup.value.tarifa);
  console.log(typeof this.theFormGroup.value.tiempoEstimadoTotal);

    this.rutasService.update(this.theFormGroup.value).subscribe({
      next: (ruta) => {
        console.log('ruta updated successfully:', ruta);

        Swal.fire({
          title: 'Actualizado!',
          text: 'Registro actualizado correctamente.',
          icon: 'success',
        });

        this.router.navigate(['/rutas/list']);
      },
      error: (error) => {
        console.error('Error updating ruta:', error);
      }
    });
  }
}
