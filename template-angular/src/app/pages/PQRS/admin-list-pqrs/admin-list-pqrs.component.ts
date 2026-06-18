import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import Swal from 'sweetalert2';

import { PqrsService } from 'src/app/services/PQRS/pqrs.service'; // Ajusta la ruta a tu servicio
import { UserService } from 'src/app/services/User/user.service';

@Component({
  selector: 'app-admin-list-pqrs',
  templateUrl: './admin-list-pqrs.component.html',
  styleUrls: ['./admin-list-pqrs.component.scss']
})
export class AdminListPqrsComponent implements OnInit {

  pqrsList: any[] = [];
  resumenUsuarios: any[] = [];

  constructor(
    private pqrsService: PqrsService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarPQRS();
  }

  cargarPQRS(): void {
    // Usamos el método que lista todos los PQRS del sistema
    this.pqrsService.list().subscribe({
      next: (data) => {
        this.pqrsList = data;
        const resumen = this.agruparPorUsuario(data);
        this.cargarNombresUsuarios(resumen);
      },
      error: (error) => {
        console.error('Error cargando PQRS:', error);
        Swal.fire('Error', error.error?.message || 'No se pudieron cargar los PQRS.', 'error');
      }
    });
  }

  agruparPorUsuario(pqrsArray: any[]): any[] {
    const mapa = new Map<string, any>();

    for (const pqrs of pqrsArray) {
      const usuarioId = pqrs.usuarioId;

      if (!usuarioId) continue;

      if (!mapa.has(usuarioId)) {
        mapa.set(usuarioId, {
          usuarioId,
          nombreUsuario: usuarioId,
          cantidadPQRS: 0,
          ultimoPQRS: null,
        });
      }

      const item = mapa.get(usuarioId);
      item.cantidadPQRS++;

      if (!item.ultimoPQRS || new Date(pqrs.createdAt).getTime() > new Date(item.ultimoPQRS).getTime()) {
        item.ultimoPQRS = pqrs.createdAt;
      }
    }

    return Array.from(mapa.values());
  }

  cargarNombresUsuarios(resumen: any[]): void {
    if (resumen.length === 0) {
      this.resumenUsuarios = [];
      return;
    }

    const requests = resumen.map((item) => {
      if (!item.usuarioId) {
        return of({ ...item, nombreUsuario: 'Sin usuario' });
      }

      return this.userService.view(item.usuarioId).pipe(
        catchError(() => of({ _id: item.usuarioId, name: item.usuarioId }))
      );
    });

    forkJoin(requests).subscribe({
      next: (usuarios: any[]) => {
        this.resumenUsuarios = resumen.map((item, index) => {
          const usuario = usuarios[index];
          return {
            ...item,
            nombreUsuario: usuario?.name || usuario?.username || usuario?.email || item.usuarioId
          };
        });
      },
      error: (error) => {
        console.error('Error cargando nombres de usuarios:', error);
        this.resumenUsuarios = resumen;
      }
    });
  }

  verHistorial(usuarioId: string): void {
    this.router.navigate(['/pqrs/admin/usuario', usuarioId], {
      state: { returnUrl: '/pqrs/admin' }
    });
  }
}
