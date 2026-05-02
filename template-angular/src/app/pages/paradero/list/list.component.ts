import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Paradero } from 'src/app/models/Paradero/paradero.model';
import { ParaderoService } from 'src/app/services/Paradero/paradero.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {

  paraderos: Paradero[] = [];

  constructor(
    private paraderoService: ParaderoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.list();
  }

  list() {
    this.paraderoService.getAll().subscribe({
      next: (data) => {
        this.paraderos = data;
      }
    });
  }

  create() {
    this.router.navigate(['/paraderos/create']);
  }

  view(id: number) {
    this.router.navigate(['/paraderos/view/' + id]);
  }

  edit(id: number) {
    this.router.navigate(['/paraderos/update/' + id]);
  }

  delete(id: number) {
    Swal.fire({
      title: 'Eliminar',
      text: '¿Está seguro que quiere eliminar este paradero?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.paraderoService.eliminar(id).subscribe({
          next: () => {
            Swal.fire('Eliminado!', 'Paradero eliminado correctamente.', 'success');
            this.list();
          },
          error: () => {
            Swal.fire('Error', 'No se pudo eliminar el paradero.', 'error');
          }
        });
      }
    });
  }

  getClasificacionLabel(c: string): string {
    const labels: Record<string, string> = {
      principal:  'Principal',
      secundario: 'Secundario',
      terminal:   'Terminal',
    };
    return labels[c] ?? c;
  }
}
