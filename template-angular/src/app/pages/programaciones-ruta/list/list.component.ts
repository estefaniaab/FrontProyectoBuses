import { Component, OnInit } from '@angular/core';
import { ProgramacionRuta } from 'src/app/models/Programaciones-ruta/programacion-ruta.model';
import { ProgramacionesRutaService } from 'src/app/services/Programaciones-ruta/programaciones-ruta.servicie';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  programaciones: ProgramacionRuta[] = [];

  constructor(private service: ProgramacionesRutaService) {}

  ngOnInit(): void {
    this.list();
  }

  list(): void {
    this.service.findAll().subscribe({
      next: (data) => (this.programaciones = data),
      error: (err) => console.error('Error al obtener programaciones', err)
    });
  }

  cancelar(prog: ProgramacionRuta): void {
    Swal.fire({
      title: '¿Cancelar programación?',
      text: `Se cancelará la programación de la ruta ${prog.ruta?.nombre ?? ''} del ${prog.fechaSalida} a las ${prog.horaSalida}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No',
      confirmButtonColor: '#f5365c'
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.cancelar(prog.id!).subscribe({
          next: () => {
            Swal.fire('Cancelada', 'La programación fue cancelada.', 'success');
            this.list();
          },
          error: (err) => Swal.fire('Error', err.error?.message || 'No se pudo cancelar', 'error')
        });
      }
    });
  }

  delete(prog: ProgramacionRuta): void {
    Swal.fire({
      title: '¿Eliminar programación?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#f5365c'
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.remove(prog.id!).subscribe({
          next: () => {
            Swal.fire('Eliminada', 'Programación eliminada correctamente.', 'success');
            this.list();
          },
          error: (err) => Swal.fire('Error', err.error?.message || 'No se pudo eliminar', 'error')
        });
      }
    });
  }

  recurrenciaLabel(r?: string): string {
    const map: Record<string, string> = {
      ninguna:       'Sin recurrencia',
      lunes_viernes: 'Lunes a viernes',
      fines_semana:  'Fines de semana',
      diaria:        'Diaria',
    };
    return r ? (map[r] ?? r) : '—';
  }

}
