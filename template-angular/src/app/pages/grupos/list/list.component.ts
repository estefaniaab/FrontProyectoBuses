import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Grupo } from 'src/app/models/Grupos/grupo.model';
import { GrupoService } from 'src/app/services/Grupo/grupo.service';

@Component({
  selector: 'app-list-grupos',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit {
  grupos: Grupo[] = [];
  busqueda = '';
  cargando = false;

  get usuarioActual(): string {
    const session = localStorage.getItem('session');
    return session ? JSON.parse(session)?.id ?? '' : '';
  }

  constructor(
    public router: Router,
    private grupoService: GrupoService,
  ) {}

  ngOnInit(): void { this.list(); }

  list(): void {
    this.cargando = true;
    this.grupoService.list(this.busqueda).subscribe({
      next: grupos => { this.grupos = grupos; this.cargando = false; },
      error: ()     => { this.cargando = false; },
    });
  }

  buscar(): void { this.list(); }
  limpiarBusqueda(): void { this.busqueda = ''; this.list(); }
  create(): void  { this.router.navigate(['/grupos/create']); }
  manage(id: number): void { this.router.navigate(['/grupos/manage', id]); }

  // FIX: verificar membresía antes de entrar al chat
  chat(grupo: Grupo): void {
    this.grupoService.verificarMembresia(grupo.id!, this.usuarioActual).subscribe({
      next: ({ esMiembro }) => {
        if (esMiembro) {
          this.router.navigate(['/grupos/chat', grupo.id]);
        } else {
          Swal.fire({
            title: 'Acceso denegado',
            text: `Debes unirte al grupo "${grupo.nombre}" antes de acceder al chat.`,
            icon: 'warning',
            confirmButtonText: 'Entendido',
          });
        }
      },
      error: () => {
        Swal.fire('Error', 'No se pudo verificar tu membresía.', 'error');
      },
    });
  }
  unirse(grupo: Grupo): void {
    Swal.fire({
      title: `¿Unirte a "${grupo.nombre}"?`,
      text: 'Pasarás a ser miembro y recibirás mensajes de este grupo.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Unirse',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#2dce89',
    }).then(result => {
      if (result.isConfirmed) {
        this.grupoService.unirse(grupo.id!, this.usuarioActual).subscribe({
          next: () => {
            Swal.fire('¡Bienvenido!', `Te uniste al grupo "${grupo.nombre}"`, 'success');
            this.list();
          },
          error: err => Swal.fire('Error', err.error?.message || 'No se pudo unir al grupo', 'error'),
        });
      }
    });
  }

  abandonar(grupo: Grupo): void {
    Swal.fire({
      title: `¿Abandonar "${grupo.nombre}"?`,
      text: 'Dejarás de recibir mensajes y notificaciones del grupo.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Abandonar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#f5365c',
    }).then(result => {
      if (result.isConfirmed) {
        this.grupoService.abandonar(grupo.id!, this.usuarioActual).subscribe({
          next: () => {
            Swal.fire('Listo', 'Has abandonado el grupo.', 'success');
            this.list();
          },
          error: err => Swal.fire('Error', err.error?.message || 'No se pudo abandonar', 'error'),
        });
      }
    });
  }

  delete(id: number): void {
    Swal.fire({
      title: 'Eliminar',
      text: '¿Está seguro que quiere eliminar el grupo?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then(result => {
      if (result.isConfirmed) {
        this.grupoService.delete(id).subscribe({
          next: () => { Swal.fire('Eliminado!', 'Grupo eliminado.', 'success'); this.list(); },
          error: err => Swal.fire('Error', err.error?.message || 'No se pudo eliminar.', 'error'),
        });
      }
    });
  }
}
