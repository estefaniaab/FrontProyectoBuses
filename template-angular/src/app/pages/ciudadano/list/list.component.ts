import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Ciudadano } from 'src/app/models/Ciudadanos/ciudadano.model';
import { CiudadanoService } from 'src/app/services/Ciudadano/ciudadano.service';
import { UserService } from 'src/app/services/User/user.service';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-list-ciudadanos',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  ciudadanos: any[] = [];

  constructor(
    private ciudadanoService: CiudadanoService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.list();
  }

  list(): void {
    this.ciudadanoService.list().subscribe({
      next: (data) => {
        this.cargarUsuarios(data);
      },
      error: (error) => {
        console.error('Error listando ciudadanos:', error);

        Swal.fire(
          'Error',
          error.error?.message || 'No se pudieron cargar los ciudadanos.',
          'error'
        );
      }
    });
  }

  cargarUsuarios(ciudadanos: Ciudadano[]): void {
    const requests = ciudadanos.map((ciudadano) => {
      if (!ciudadano.usuarioId) {
        return of({
          ...ciudadano,
          nombreUsuario: 'Sin usuario'
        });
      }

      return this.userService.view(ciudadano.usuarioId).pipe(
        catchError(() => {
          return of({
            _id: ciudadano.usuarioId,
            name: 'Usuario no encontrado'
          });
        })
      );
    });

    forkJoin(requests).subscribe({
      next: (usuarios: any[]) => {
        this.ciudadanos = ciudadanos.map((ciudadano, index) => {
          const usuario = usuarios[index];

          return {
            ...ciudadano,
            usuario,
            nombreUsuario:
              usuario?.name ||
              usuario?.username ||
              usuario?.email ||
              ciudadano.usuarioId
          };
        });
      },
      error: (error) => {
        console.error('Error cargando usuarios:', error);
        this.ciudadanos = ciudadanos;
      }
    });
  }

  create(): void {
    this.router.navigate(['/ciudadanos/create']);
  }

  view(id: number | undefined): void {
    if (!id) return;
    this.router.navigate(['/ciudadanos/view', id]);
  }

  edit(id: number | undefined): void {
    if (!id) return;
    this.router.navigate(['/ciudadanos/update', id]);
  }

  delete(id: number | undefined): void {
    if (!id) return;

    Swal.fire({
      title: 'Eliminar',
      text: '¿Está seguro que quiere eliminar este ciudadano?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.ciudadanoService.delete(id).subscribe({
          next: () => {
            Swal.fire(
              'Eliminado',
              'Ciudadano eliminado correctamente.',
              'success'
            );

            this.list();
          },
          error: (error) => {
            console.error('Error eliminando ciudadano:', error);

            Swal.fire(
              'Error',
              error.error?.message || 'No se pudo eliminar el ciudadano.',
              'error'
            );
          }
        });
      }
    });
  }
}
