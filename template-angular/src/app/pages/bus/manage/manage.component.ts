import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Bus } from '../../../models/Buses/bus.model';
import { BusService } from '../../../services/Bus/bus.service';
import { EstadoBus } from '../../../models/Buses/estado-bus.enum';
import { Incidente, StatsIncidente } from 'src/app/models/Incidentes/incidente.model';
import { IncidentesService } from 'src/app/services/Incidentes/incidentes.service';
import { Empresa } from '../../../models/Empresas/empresa.model';
import { EmpresaService } from '../../../services/Empresas/empresa.service';

@Component({
  selector: 'app-manage-buses',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss']
})
export class ManageComponent implements OnInit {
  mode!: number;
  bus!: Bus;
  theFormGroup!: FormGroup;
  trySend: boolean;
  photoPreview: string | null = null;

  // ── Incidentes ──
  incidentes: Incidente[] = [];
  stats?: StatsIncidente;
  filtroTipo   = '';
  filtroEstado = '';

  empresas: Empresa[] = [];

  estadosBus = [
    { value: EstadoBus.OPERATIVO,         label: 'Operativo' },
    { value: EstadoBus.MANTENIMIENTO,     label: 'Mantenimiento' },
    { value: EstadoBus.FUERA_DE_SERVICIO, label: 'Fuera de servicio' },
  ];

  constructor(
    private activatedRoute: ActivatedRoute,
    private busesService: BusService,
    private router: Router,
    private theFormBuilder: FormBuilder,
    private incidentesService: IncidentesService, // ← AGREGAR
    private empresaService: EmpresaService,
  ) {
    this.trySend = false;

    this.bus = {
      id: 0, placa: '', modelo: '', anio: 0,
      capacidadMaximaPasajeros: 0, capacidadSentados: 0,
      capacidadParados: 0, estado: EstadoBus.OPERATIVO,
      fotoUrl: '', codigoQr: ''
    };

    this.configFormGroup();
  }

  ngOnInit(): void {
    this.cargarEmpresas();
    const currentUrl = this.activatedRoute.snapshot.url.join('/');

    if (currentUrl.includes('view'))        this.mode = 1;
    else if (currentUrl.includes('create')) this.mode = 2;
    else if (currentUrl.includes('update')) this.mode = 3;

    if (this.mode === 1) this.theFormGroup.disable();

    if (this.activatedRoute.snapshot.params.id) {
      this.bus.id = Number(this.activatedRoute.snapshot.params.id);
      this.getBus(this.bus.id);
    }
  }

  configFormGroup() {
    this.theFormGroup = this.theFormBuilder.group({
      id:                       [0,   []],
      placa:                    ['',  [Validators.required, Validators.minLength(5), Validators.maxLength(10)]],
      modelo:                   ['',  [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      anio:                     [0,   [Validators.required, Validators.min(1990), Validators.max(2030)]],
      capacidadMaximaPasajeros: [0,   [Validators.required, Validators.min(1), Validators.max(200)]],
      capacidadSentados:        [0,   [Validators.required, Validators.min(0), Validators.max(200)]],
      capacidadParados:         [0,   [Validators.required, Validators.min(0), Validators.max(200)]],
      estado:                   [EstadoBus.OPERATIVO, [Validators.required]],
      fotoUrl:                  ['',  []],
      codigoQr:                 ['',  []],
      empresaId: [null],
    });
  }

  get getTheFormGroup() { return this.theFormGroup.controls; }

  getBus(id: number) {
    this.busesService.view(id).subscribe({
      next: (response) => {
        this.bus = response;
        this.theFormGroup.patchValue({
          id:                       this.bus.id,
          placa:                    this.bus.placa,
          modelo:                   this.bus.modelo,
          anio:                     Number(this.bus.anio),
          capacidadMaximaPasajeros: Number(this.bus.capacidadMaximaPasajeros),
          capacidadSentados:        Number(this.bus.capacidadSentados),
          capacidadParados:         Number(this.bus.capacidadParados),
          estado:                   this.bus.estado,
          fotoUrl:                  this.bus.fotoUrl,
          codigoQr:                 this.bus.codigoQr,
          empresaId: this.bus.empresaId || this.bus.empresa?.id || null,
        });
        if (this.bus.fotoUrl) this.photoPreview = this.bus.fotoUrl;

        // ← AGREGAR: cargar incidentes después de tener el bus
        this.cargarIncidentes();
      },
      error: (error) => console.error('Error fetching bus:', error),
    });
  }

  cargarEmpresas(): void {
    this.empresaService.list().subscribe({
      next: (data) => {
        this.empresas = data.filter(empresa => empresa.activo !== false);
      },
      error: (error) => {
        console.error('Error cargando empresas:', error);
      }
    });
  }

  // ── Métodos Incidentes ────────────────────────────────────────────────────

  cargarIncidentes(): void {
    if (!this.bus.id) return;
    this.incidentesService.findByBus(
      this.bus.id,
      this.filtroTipo   || undefined,
      this.filtroEstado || undefined,
    ).subscribe({
      next: (data) => (this.incidentes = data),
      error: (err)  => console.error('Error al cargar incidentes', err),
    });

    this.incidentesService.getStatsByBus(this.bus.id).subscribe({
      next: (data) => (this.stats = data),
      error: (err)  => console.error('Error al cargar estadísticas', err),
    });
  }

  cambiarEstado(incidente: Incidente, estado: string): void {
    this.incidentesService.update(incidente.id!, { estado }).subscribe({
      next: () => this.cargarIncidentes(),
      error: (err) => Swal.fire('Error', err.error?.message || 'No se pudo actualizar', 'error'),
    });
  }

  agregarComentario(incidente: Incidente): void {
    Swal.fire({
      title: 'Agregar Comentario',
      input: 'textarea',
      inputPlaceholder: 'Escribe el comentario de seguimiento...',
      inputValue: incidente.comentario || '',
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.incidentesService.update(incidente.id!, { comentario: result.value }).subscribe({
          next: () => {
            Swal.fire('Guardado', 'Comentario actualizado.', 'success');
            this.cargarIncidentes();
          },
          error: (err) => Swal.fire('Error', err.error?.message || 'No se pudo guardar', 'error'),
        });
      }
    });
  }

  // ── CRUD Bus ──────────────────────────────────────────────────────────────

  back() { this.router.navigate(['/buses/list']); }

  create() {
    this.trySend = true;

    if (this.theFormGroup.invalid) {
      Swal.fire({
        title: 'Error!',
        text: 'Por favor, complete todos los campos requeridos.',
        icon: 'error'
      });
      return;
    }

    if (!this.validarCapacidad()) {
      return;
    }

    this.busesService.create(this.theFormGroup.value).subscribe({
      next: () => {
        Swal.fire({
          title: 'Creado!',
          text: 'Registro creado correctamente.',
          icon: 'success'
        });

        this.router.navigate(['/buses/list']);
      },
      error: (error) => {
        Swal.fire({
          title: 'Error!',
          text: error.error?.message || 'No se pudo crear el bus.',
          icon: 'error'
        });
      },
    });
  }

  update() {
    this.trySend = true;

    if (this.theFormGroup.invalid) {
      Swal.fire({
        title: 'Error!',
        text: 'Por favor, complete todos los campos requeridos.',
        icon: 'error'
      });
      return;
    }

    if (!this.validarCapacidad()) {
      return;
    }

    this.busesService.update(this.theFormGroup.value).subscribe({
      next: () => {
        Swal.fire({
          title: 'Actualizado!',
          text: 'Registro actualizado correctamente.',
          icon: 'success'
        });

        this.router.navigate(['/buses/list']);
      },
      error: (error) => {
        Swal.fire({
          title: 'Error!',
          text: error.error?.message || 'No se pudo actualizar el bus.',
          icon: 'error'
        });
      },
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      Swal.fire({ title: 'Imagen muy grande', text: 'La imagen no debe superar los 2 MB.', icon: 'warning' });
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

  validarCapacidad(): boolean {
    const capacidadMaximaPasajeros = Number(
      this.theFormGroup.get('capacidadMaximaPasajeros')?.value || 0
    );

    const capacidadSentados = Number(
      this.theFormGroup.get('capacidadSentados')?.value || 0
    );

    const capacidadParados = Number(
      this.theFormGroup.get('capacidadParados')?.value || 0
    );

    const total = capacidadSentados + capacidadParados;

    if (total > capacidadMaximaPasajeros) {
      Swal.fire(
        'Capacidad inválida',
        `La suma de sentados y parados (${total}) no puede superar la capacidad máxima (${capacidadMaximaPasajeros}).`,
        'warning'
      );

      return false;
    }

    return true;
  }

  getTotalCapacidadUsada(): number {
    const sentados = Number(
      this.theFormGroup.get('capacidadSentados')?.value || 0
    );

    const parados = Number(
      this.theFormGroup.get('capacidadParados')?.value || 0
    );

    return sentados + parados;
  }

  getCapacidadMaxima(): number {
    return Number(
      this.theFormGroup.get('capacidadMaximaPasajeros')?.value || 0
    );
  }

  capacidadExcedida(): boolean {
    return this.getTotalCapacidadUsada() > this.getCapacidadMaxima();
  }
}
