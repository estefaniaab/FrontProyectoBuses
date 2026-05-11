import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TurnosService } from 'src/app/services/Turnos/turnos.servicie';
import { Turno } from 'src/app/models/Turnos/turnos.model';
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

  turno?: Turno; // ← datos completos del turno (horas reales, estado bus, etc.)

  conductores: any[] = [];
  buses: Bus[] = [];

  constructor(
    private fb: FormBuilder,
    private service: TurnosService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      conductorId: [null, [Validators.required]],
      busId:       [null, [Validators.required]],
      horaInicio:  ['',   [Validators.required]],
      horaFin:     ['',   [Validators.required]]
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

    if (this.id) {
      this.loadTurno();
    }
  }

  loadResources(): void {
    this.service.getConductores().subscribe({
      next: (data) => (this.conductores = data),
      error: (err) => console.error('Error al cargar conductores', err)
    });

    this.service.getBuses().subscribe({
      next: (data) => (this.buses = data),
      error: (err) => console.error('Error al cargar buses', err)
    });
  }

  loadTurno(): void {
    this.service.view(this.id!).subscribe({
      next: (data) => {
        this.turno = data; // ← guarda el turno completo para el template

        this.form.patchValue({
          conductorId: data.conductorId,
          busId:       data.busId,
          horaInicio:  data.horaInicio ? new Date(data.horaInicio).toISOString().slice(0, 16) : '',
          horaFin:     data.horaFin    ? new Date(data.horaFin).toISOString().slice(0, 16)    : ''
        });
      },
      error: (err) => console.error('Error al cargar turno', err)
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      Swal.fire('Atención', 'Por favor completa todos los campos obligatorios.', 'warning');
      return;
    }

    const raw = this.form.getRawValue();

    const payload = {
      conductorId: Number(raw.conductorId),
      busId:       Number(raw.busId),
      horaInicio:  new Date(raw.horaInicio).toISOString(),
      horaFin:     new Date(raw.horaFin).toISOString()
    };

    const request$ = this.isEdit
      ? this.service.update(this.id!, payload)
      : this.service.create(payload);

    request$.subscribe({
      next: () => {
        Swal.fire('¡Éxito!', `Turno ${this.isEdit ? 'actualizado' : 'programado'} correctamente.`, 'success');
        this.router.navigate(['/turnos/list']);
      },
      error: (err) => {
        Swal.fire('Error', err.error?.message || 'No se pudo procesar el turno.', 'error');
      }
    });
  }
}
