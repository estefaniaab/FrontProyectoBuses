import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Bus } from 'src/app/models/Buses/bus.model';
import { BusService } from 'src/app/services/Bus/bus.service';
import { IncidentesService } from 'src/app/services/Incidentes/incidentes.service';
import { TurnosService } from 'src/app/services/Turnos/turnos.servicie';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list-buses',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  buses: Bus[] = [];
  focus = false;

  // ── Modal Incidente ──
  mostrarModalIncidente = false;
  busSeleccionado?: Bus;
  conductorIdLogueado?: number;
  conductores: any[] = [];
  incidenteForm = {
    tipo: '',
    gravedad: '',
    descripcion: '',
    conductorId: null as number | null,
  };
  fotosSeleccionadas: { urlFoto: string; descripcion?: string }[] = [];

  tiposIncidente = [
    { value: 'mecanico',  label: '🔧 Mecánico' },
    { value: 'accidente', label: '🚨 Accidente' },
    { value: 'retraso',   label: '⏰ Retraso' },
    { value: 'otro',      label: '📋 Otro' },
  ];

  gravedades = [
    { value: 'bajo',    label: '🟢 Bajo' },
    { value: 'medio',   label: '🟡 Medio' },
    { value: 'alto',    label: '🟠 Alto' },
    { value: 'critico', label: '🔴 Crítico' },
  ];

  constructor(
    private busesService: BusService,
    private router: Router,
    private incidentesService: IncidentesService,
    private turnosService: TurnosService,
  ) {}

  ngOnInit(): void {
    this.list();
    this.resolverConductorLogueado();
    this.cargarConductores();
  }

  list() {
    this.busesService.list().subscribe({
      next: (buses) => (this.buses = buses),
      error: (err)  => console.error('Error listing buses:', err),
    });
  }

  create() { this.router.navigate(['/buses/create']); }
  view(id: number) { this.router.navigate(['/buses/view/' + id]); }
  edit(id: number) { this.router.navigate(['/buses/update/' + id]); }

  delete(id: number) {
    Swal.fire({
      title: 'Eliminar',
      text: '¿Está seguro que quiere eliminar el registro?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.busesService.delete(id).subscribe({
          next: () => {
            Swal.fire('Eliminado!', 'Registro eliminado correctamente.', 'success');
            this.list();
          },
          error: (err) => {
            Swal.fire('Error', err.error?.message || 'Ocurrió un error al eliminar.', 'error');
          }
        });
      }
    });
  }

  // ── Métodos Modal Incidente ──────────────────────────────────────────────

  private resolverConductorLogueado(): void {
    const userRaw = localStorage.getItem('user');
    if (!userRaw) return;
    try {
      const user = JSON.parse(userRaw);
      const userId = user?.id as string;
      if (!userId) return;
      this.incidentesService.getConductorByUsuarioId(userId).subscribe({
        next: (conductor) => {
          if (conductor?.id) this.conductorIdLogueado = conductor.id;
        },
        error: () => { /* es admin, no es conductor */ }
      });
    } catch { }
  }

  cargarConductores(): void {
    this.turnosService.getConductores().subscribe({
      next: (data) => (this.conductores = data),
      error: (err) => console.error('Error al cargar conductores', err),
    });
  }

  abrirModalIncidente(bus: Bus): void {
    this.busSeleccionado = bus;
    this.fotosSeleccionadas = [];
    this.incidenteForm = {
      tipo: '',
      gravedad: '',
      descripcion: '',
      conductorId: this.conductorIdLogueado || null,
    };
    this.mostrarModalIncidente = true;
  }

  cerrarModalIncidente(): void {
    this.mostrarModalIncidente = false;
    this.busSeleccionado = undefined;
  }

  onFotosSeleccionadas(event: any): void {
    const files: FileList = event.target.files;
    const disponibles = 5 - this.fotosSeleccionadas.length;
    const aLeer = Math.min(files.length, disponibles);
    for (let i = 0; i < aLeer; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = () => {
        this.fotosSeleccionadas.push({ urlFoto: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  }

  eliminarFoto(index: number): void {
    this.fotosSeleccionadas.splice(index, 1);
  }

  submitIncidente(): void {
    if (!this.incidenteForm.tipo || !this.incidenteForm.gravedad) {
      Swal.fire('Atención', 'Selecciona el tipo y la gravedad del incidente.', 'warning');
      return;
    }

    const dto = {
      tipo:        this.incidenteForm.tipo,
      gravedad:    this.incidenteForm.gravedad,
      descripcion: this.incidenteForm.descripcion,
      busId:       this.busSeleccionado!.id!,
      conductorId: this.incidenteForm.conductorId || undefined,
      fotos:       this.fotosSeleccionadas,
    };

    this.incidentesService.reportar(dto).subscribe({
      next: () => {
        this.cerrarModalIncidente();
        Swal.fire('¡Incidente Reportado!', 'El incidente fue registrado correctamente.', 'success');
      },
      error: (err) => Swal.fire('Error', err.error?.message || 'No se pudo reportar el incidente.', 'error'),
    });
  }
}
