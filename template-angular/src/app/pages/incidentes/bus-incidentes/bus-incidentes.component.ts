import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import Swal from 'sweetalert2';

import { Incidente, StatsIncidente } from 'src/app/models/Incidentes/incidente.model';
import { IncidentesService } from 'src/app/services/Incidentes/incidentes.service';

@Component({
  selector: 'app-bus-incidentes',
  templateUrl: './bus-incidentes.component.html',
  styleUrls: ['./bus-incidentes.component.scss']
})
export class BusIncidentesComponent implements OnInit {

  busId!: number;

  incidentes: Incidente[] = [];
  stats?: StatsIncidente;

  filtroTipo = '';
  filtroEstado = '';

  incidenteSeleccionado?: Incidente;
  comentarioNuevo = '';
  estadoNuevo = '';

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private incidentesService: IncidentesService
  ) {}

  ngOnInit(): void {
    this.busId = Number(this.activatedRoute.snapshot.params['busId']);

    if (!this.busId || isNaN(this.busId)) {
      Swal.fire(
        'Error',
        'No se pudo obtener el bus.',
        'error'
      );

      this.back();
      return;
    }

    this.cargarIncidentes();
    this.cargarStats();
  }

  cargarIncidentes(): void {
    this.incidentesService.findByBus(
      this.busId,
      this.filtroTipo || undefined,
      this.filtroEstado || undefined
    ).subscribe({
      next: (data) => {
        this.incidentes = data;
      },
      error: (error) => {
        console.error('Error cargando incidentes:', error);

        Swal.fire(
          'Error',
          error.error?.message || 'No se pudieron cargar los incidentes.',
          'error'
        );
      }
    });
  }

  cargarStats(): void {
    this.incidentesService.getStatsByBus(this.busId).subscribe({
      next: (data) => {
        this.stats = data;
      },
      error: (error) => {
        console.error('Error cargando estadísticas:', error);
      }
    });
  }

  limpiarFiltros(): void {
    this.filtroTipo = '';
    this.filtroEstado = '';
    this.cargarIncidentes();
  }

  abrirSeguimiento(incidente: Incidente): void {
    this.incidenteSeleccionado = incidente;
    this.estadoNuevo = incidente.estado || 'pendiente';
    this.comentarioNuevo = incidente.comentario || '';
  }

  cerrarSeguimiento(): void {
    this.incidenteSeleccionado = undefined;
    this.estadoNuevo = '';
    this.comentarioNuevo = '';
  }

  guardarSeguimiento(): void {
    if (!this.incidenteSeleccionado?.id) {
      return;
    }

    this.incidentesService.update(this.incidenteSeleccionado.id, {
      estado: this.estadoNuevo,
      comentario: this.comentarioNuevo
    }).subscribe({
      next: () => {
        Swal.fire(
          'Actualizado',
          'El incidente fue actualizado correctamente.',
          'success'
        );

        this.cerrarSeguimiento();
        this.cargarIncidentes();
        this.cargarStats();
      },
      error: (error) => {
        console.error('Error actualizando incidente:', error);

        Swal.fire(
          'Error',
          error.error?.message || 'No se pudo actualizar el incidente.',
          'error'
        );
      }
    });
  }

  abrirMapa(incidente: Incidente): void {
    if (!incidente.latitud || !incidente.longitud) {
      Swal.fire(
        'Sin ubicación',
        'Este incidente no tiene ubicación GPS registrada.',
        'info'
      );
      return;
    }

    const url = `https://www.google.com/maps?q=${incidente.latitud},${incidente.longitud}`;
    window.open(url, '_blank');
  }

  back(): void {
    this.router.navigate(['/buses/list']);
  }
}
