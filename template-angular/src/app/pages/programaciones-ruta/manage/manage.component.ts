import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProgramacionesRutaService, Ruta } from 'src/app/services/Programaciones-ruta/programaciones-ruta.servicie';
import { ProgramacionRuta } from 'src/app/models/Programaciones-ruta/programacion-ruta.model';
import { Bus } from 'src/app/models/Buses/bus.model';
import Swal from 'sweetalert2';

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

  programacion?: ProgramacionRuta;
  rutas: Ruta[] = [];
  buses: Bus[] = [];

  recurrenciaOpciones = [
    { value: 'ninguna',       label: 'Sin recurrencia' },
    { value: 'lunes_viernes', label: 'Lunes a viernes' },
    { value: 'fines_semana',  label: 'Fines de semana' },
    { value: 'diaria',        label: 'Diaria' },
  ];

  constructor(
    private fb: FormBuilder,
    private service: ProgramacionesRutaService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      rutaId:           [null, [Validators.required]],
      busId:            [null, [Validators.required]],
      fechaSalida:      ['',   [Validators.required]],
      horaSalida:       ['',   [Validators.required]],
      recurrencia:      ['ninguna'],
      toleranciaSalida: [5,    [Validators.min(0), Validators.max(60)]],
    });
  }

  ngOnInit(): void {
    const rawId = this.route.snapshot.params['id'];
    this.id = rawId ? +rawId : undefined;

    const url = this.route.snapshot.url.join('/');
    this.isView = url.includes('view');
    this.isEdit = url.includes('update');

    if (this.isView) this.form.disable();

    this.loadResources();

    if (this.id) this.loadProgramacion();
  }

  loadResources(): void {
    this.service.getRutas().subscribe({
      next: (data) => (this.rutas = data),
      error: (err) => console.error('Error al cargar rutas', err)
    });

    this.service.getBuses().subscribe({
      next: (data) => (this.buses = data),
      error: (err) => console.error('Error al cargar buses', err)
    });
  }

  loadProgramacion(): void {
    this.service.view(this.id!).subscribe({
      next: (data) => {
        this.programacion = data;
        this.form.patchValue({
          rutaId:           data.rutaId,
          busId:            data.busId,
          fechaSalida:      data.fechaSalida,
          horaSalida:       data.horaSalida?.slice(0, 5), // HH:mm
          recurrencia:      data.recurrencia ?? 'ninguna',
          toleranciaSalida: data.toleranciaSalida ?? 5,
        });
      },
      error: (err) => console.error('Error al cargar programación', err)
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      Swal.fire('Atención', 'Por favor completa todos los campos obligatorios.', 'warning');
      return;
    }

    const raw = this.form.getRawValue();

    const payload: Partial<ProgramacionRuta> = {
      rutaId:           Number(raw.rutaId),
      busId:            Number(raw.busId),
      fechaSalida:      raw.fechaSalida,
      horaSalida:       raw.horaSalida,
      recurrencia:      raw.recurrencia,
      toleranciaSalida: Number(raw.toleranciaSalida),
    };

    const request$ = this.isEdit
      ? this.service.update(this.id!, payload)
      : this.service.create(payload);

    request$.subscribe({
      next: () => {
        Swal.fire('¡Éxito!', `Programación ${this.isEdit ? 'actualizada' : 'creada'} correctamente.`, 'success');
        this.router.navigate(['/programaciones-ruta/list']);
      },
      error: (err) => {
        Swal.fire('Error', err.error?.message || 'No se pudo procesar la programación.', 'error');
      }
    });
  }
}
