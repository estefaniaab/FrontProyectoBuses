import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import Swal from 'sweetalert2';

import { Recarga } from 'src/app/models/Recargas/recarga.model';
import { RecargaService } from 'src/app/services/Recarga/recarga.service';
import { UserService } from 'src/app/services/User/user.service';

@Component({
  selector: 'app-admin-list-recargas',
  templateUrl: './admin-list.component.html',
  styleUrls: ['./admin-list.component.scss']
})
export class AdminListComponent implements OnInit {

  recargas: Recarga[] = [];
  resumenCiudadanos: any[] = [];

  constructor(
    private recargaService: RecargaService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarRecargas();
  }

  cargarRecargas(): void {
    this.recargaService.list().subscribe({
      next: (data) => {
        this.recargas = data;
        const resumen = this.agruparPorCiudadano(data);
        this.cargarNombresUsuarios(resumen);
      },
      error: (error) => {
        console.error('Error cargando recargas:', error);

        Swal.fire(
          'Error',
          error.error?.message || 'No se pudieron cargar las recargas.',
          'error'
        );
      }
    });
  }

  agruparPorCiudadano(recargas: Recarga[]): any[] {
    const mapa = new Map<number, any>();

    for (const recarga of recargas as any[]) {
      const ciudadano = recarga.metodoPagoCiudadano?.ciudadano;
      const ciudadanoId = ciudadano?.id;

      if (!ciudadanoId) {
        continue;
      }

      if (!mapa.has(ciudadanoId)) {
        mapa.set(ciudadanoId, {
          ciudadanoId,
          usuarioId: ciudadano.usuarioId,
          nombreUsuario: ciudadano.usuarioId,
          cantidadRecargas: 0,
          ultimaRecarga: null,
        });
      }

      const item = mapa.get(ciudadanoId);

      item.cantidadRecargas++;

      if (
        !item.ultimaRecarga ||
        new Date(recarga.createdAt).getTime() > new Date(item.ultimaRecarga).getTime()
      ) {
        item.ultimaRecarga = recarga.createdAt;
      }
    }

    return Array.from(mapa.values());
  }

  cargarNombresUsuarios(resumen: any[]): void {
    if (resumen.length === 0) {
      this.resumenCiudadanos = [];
      return;
    }

    const requests = resumen.map((item) => {
      if (!item.usuarioId) {
        return of({
          ...item,
          nombreUsuario: 'Sin usuario'
        });
      }

      return this.userService.view(item.usuarioId).pipe(
        catchError(() => {
          return of({
            _id: item.usuarioId,
            name: item.usuarioId
          });
        })
      );
    });

    forkJoin(requests).subscribe({
      next: (usuarios: any[]) => {
        this.resumenCiudadanos = resumen.map((item, index) => {
          const usuario = usuarios[index];

          return {
            ...item,
            nombreUsuario:
              usuario?.name ||
              usuario?.username ||
              usuario?.email ||
              item.usuarioId
          };
        });
      },
      error: (error) => {
        console.error('Error cargando nombres de usuarios:', error);
        this.resumenCiudadanos = resumen;
      }
    });
  }

  verHistorial(ciudadanoId: number): void {
    this.router.navigate(['/recargas/admin/ciudadano', ciudadanoId], {
      state: {
        returnUrl: '/recargas/admin'
      }
    });
  }

}
