import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import Swal from 'sweetalert2';

import { Historial } from 'src/app/models/Historial/historial.model';
import { HistorialService } from 'src/app/services/Historial/historial.service';
import { UserService } from 'src/app/services/User/user.service';

@Component({
  selector: 'app-admin-list-historial',
  templateUrl: './admin-list.component.html',
  styleUrls: ['./admin-list.component.scss']
})
export class AdminListComponent implements OnInit {

  historial: Historial[] = [];
  resumenCiudadanos: any[] = [];

  constructor(
    private historialService: HistorialService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarHistorial();
  }

  cargarHistorial(): void {
    this.historialService.list().subscribe({
      next: (data) => {
        this.historial = data;

        const resumen = this.agruparPorCiudadano(data);
        this.cargarNombresUsuarios(resumen);
      },
      error: (error) => {
        console.error('Error cargando historial:', error);

        Swal.fire(
          'Error',
          error.error?.message || 'No se pudo cargar el historial.',
          'error'
        );
      }
    });
  }

  agruparPorCiudadano(historial: Historial[]): any[] {
    const mapa = new Map<number, any>();

    for (const item of historial as any[]) {
      const ciudadano = item.boleto?.ciudadano;
      const ciudadanoId = ciudadano?.id;
      const usuarioId = ciudadano?.usuarioId;

      if (!ciudadanoId) {
        continue;
      }

      if (!mapa.has(ciudadanoId)) {
        mapa.set(ciudadanoId, {
          ciudadanoId,
          usuarioId,
          nombreUsuario: usuarioId || `Ciudadano #${ciudadanoId}`,
          boletos: new Set<number>(),
          numeroViajes: 0,
          ultimoViaje: null,
        });
      }

      const registro = mapa.get(ciudadanoId);

      if (item.boletoId) {
        registro.boletos.add(item.boletoId);
      }

      const fecha = item.fechaValidacion;

      if (
        fecha &&
        (
          !registro.ultimoViaje ||
          new Date(fecha).getTime() > new Date(registro.ultimoViaje).getTime()
        )
      ) {
        registro.ultimoViaje = fecha;
      }
    }

    return Array.from(mapa.values()).map(item => ({
      ...item,
      numeroViajes: item.boletos.size,
    }));
  }

  cargarNombresUsuarios(resumen: any[]): void {
    if (resumen.length === 0) {
      this.resumenCiudadanos = [];
      return;
    }

    const requests = resumen.map((item) => {
      if (!item.usuarioId) {
        return of({
          name: item.nombreUsuario
        });
      }

      return this.userService.view(item.usuarioId).pipe(
        catchError(() => {
          return of({
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
              item.usuarioId ||
              `Ciudadano #${item.ciudadanoId}`,
          };
        });
      },
      error: (error) => {
        console.error('Error cargando usuarios:', error);
        this.resumenCiudadanos = resumen;
      }
    });
  }

  verHistorial(ciudadanoId: number): void {
    this.router.navigate(['/historial/admin/ciudadano', ciudadanoId], {
      state: {
        returnUrl: '/historial/admin'
      }
    });
  }
}
