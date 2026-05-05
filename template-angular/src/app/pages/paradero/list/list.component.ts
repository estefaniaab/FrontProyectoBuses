import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Paradero } from 'src/app/models/Paradero/paradero.model';
import { Nodo } from 'src/app/models/Nodos/nodo.model';
import { NodoService } from 'src/app/services/Nodo/nodo.service';
import { ClasificacionParadero } from 'src/app/models/Paradero/clasificacion-paradero.enum';
import { ParaderoService } from 'src/app/services/Paradero/paradero.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {

  paraderos: Paradero[] = [];

  selectedParadero: Paradero | null = null;
  nodosParadero: Nodo[] = [];
  showRutasModal = false;
  loadingRutas = false;
  errorRutas = '';

  constructor(
    private paraderoService: ParaderoService,
     private nodoService: NodoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.list();
  }

  list(): void {
    this.paraderoService.getAll().subscribe({
      next: (data) => {
        this.paraderos = data;
      },
      error: () => {
        Swal.fire('Error', 'No se pudieron cargar los paraderos.', 'error');
      }
    });
  }

  create(): void {
    this.router.navigate(['/paraderos/create']);
  }

  view(id?: number): void {
    if (!id) return;
    this.router.navigate(['/paraderos/view/' + id]);
  }

  edit(id?: number): void {
    if (!id) return;
    this.router.navigate(['/paraderos/update/' + id]);
  }

  delete(id?: number): void {
    if (!id) return;

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

  openRutasModal(paradero: Paradero): void {
    if (!paradero.id) return;

    this.selectedParadero = paradero;
    this.nodosParadero = [];
    this.errorRutas = '';
    this.loadingRutas = true;
    this.showRutasModal = true;

    this.nodoService.getByParadero(paradero.id).subscribe({
      next: (data) => {
        this.nodosParadero = data;
        this.loadingRutas = false;
      },
      error: () => {
        this.errorRutas = 'No se pudieron cargar las rutas de este paradero.';
        this.loadingRutas = false;
      }
    });
  }

  closeRutasModal(): void {
    this.showRutasModal = false;
    this.selectedParadero = null;
    this.nodosParadero = [];
    this.errorRutas = '';
    this.loadingRutas = false;
  }

  getClasificacionLabel(c?: ClasificacionParadero): string {
    const labels: Record<ClasificacionParadero, string> = {
      [ClasificacionParadero.PRINCIPAL]: 'Principal',
      [ClasificacionParadero.SECUNDARIO]: 'Secundario',
      [ClasificacionParadero.TERMINAL]: 'Terminal',
    };

    return c ? labels[c] : 'Sin clasificación';
  }
}
