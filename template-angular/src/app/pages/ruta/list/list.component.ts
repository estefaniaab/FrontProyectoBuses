import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Ruta } from 'src/app/models/Rutas/ruta.model';
import { RutaService } from 'src/app/services/Ruta/ruta.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list-rutas',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  rutas: Ruta[] = [];
  rutasFiltradas: Ruta[] = [];
  filtroNombre: string = '';
  focus = false;

  constructor(
    private rutasService: RutaService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.list();
  }

  list() {
    this.rutasService.list(this.filtroNombre).subscribe({
      next: (rutas) => {
        this.rutas = rutas;
      }
    });
  }

  filtrarRutas() {
    this.list();
  }

  create() {
    this.router.navigate(['/rutas/create']);
  }

  view(id: string) {
    this.router.navigate(['/rutas/view/' + id]);
  }

  edit(id: string) {
    this.router.navigate(['/rutas/update/' + id]);
  }

  delete(id: string) {
    Swal.fire({
      title: 'Eliminar',
      text: "Está seguro que quiere eliminar el registro?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.rutasService.delete(id).subscribe(() => {
          Swal.fire(
            'Eliminado!',
            'Registro eliminado correctamente.',
            'success'
          );
          this.list();
        });
      }
    });
  }
}
