import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Bus } from 'src/app/models/Buses/bus.model';
import { BusService } from 'src/app/services/Bus/bus.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list-buses',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  buses: Bus[] = [];
  focus = false;

  constructor(
    private busesService: BusService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.list();
  }

  list() {
    this.busesService.list().subscribe({
      next: (buses) => {
        this.buses = buses;
      },
      error: (err) => {
        console.error('Error listing buses:', err);
      }
    });
  }

  create() {
    this.router.navigate(['/buses/create']);
  }

  view(id: number) {
    this.router.navigate(['/buses/view/' + id]);
  }

  edit(id: number) {
    this.router.navigate(['/buses/update/' + id]);
  }

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
}
