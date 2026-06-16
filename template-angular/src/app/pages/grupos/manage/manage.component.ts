import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import {
  Grupo,
  MembresiaGrupo,
  LogMembresiaGrupo,
  RolMembresia,
} from 'src/app/models/Grupos/grupo.model';
import { GrupoService } from 'src/app/services/Grupo/grupo.service';

@Component({
  selector: 'app-manage-grupos',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss']
})
export class ManageComponent implements OnInit {
  grupo?: Grupo;
  miembros: MembresiaGrupo[] = [];
  logs: LogMembresiaGrupo[] = [];
  busquedaMiembro = '';
  verLogs = false;
  grupoId!: number;

  RolMembresia = RolMembresia;

  get usuarioActual(): string {
    const session = localStorage.getItem('session');
    return session ? JSON.parse(session)?.id ?? '' : '';
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private grupoService: GrupoService,
  ) {}

  ngOnInit(): void {
    this.grupoId = Number(this.route.snapshot.params['id']);
    this.cargarGrupo();
    this.cargarMiembros();
  }

  cargarGrupo(): void {
    this.grupoService.view(this.grupoId).subscribe({
      next: g => (this.grupo = g),
      error: err => console.error('Error cargando grupo:', err),
    });
  }

  cargarMiembros(): void {
    this.grupoService.listarMiembros(this.grupoId, this.busquedaMiembro).subscribe({
      next: m => (this.miembros = m),
      error: err => console.error('Error cargando miembros:', err),
    });
  }

  buscarMiembro(): void { this.cargarMiembros(); }

  back(): void { this.router.navigate(['/grupos/list']); }

  promover(miembro: MembresiaGrupo): void {
    const nuevoRol = miembro.rol === RolMembresia.MIEMBRO
      ? RolMembresia.ADMINISTRADOR
      : RolMembresia.MIEMBRO;

    Swal.fire({
      title: `¿Cambiar rol de ${miembro.nombreUsuario || miembro.usuarioId}?`,
      text: `Pasará a ser: ${nuevoRol}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
    }).then(result => {
      if (result.isConfirmed) {
        this.grupoService.promover(this.grupoId, miembro.usuarioId, nuevoRol, this.usuarioActual).subscribe({
          next: () => {
            Swal.fire('Listo', 'Rol actualizado correctamente', 'success');
            this.cargarMiembros();
          },
          error: err => Swal.fire('Error', err.error?.message || 'No se pudo actualizar el rol', 'error'),
        });
      }
    });
  }

  remover(miembro: MembresiaGrupo): void {
    Swal.fire({
      title: `¿Remover a ${miembro.nombreUsuario || miembro.usuarioId}?`,
      text: 'El usuario será removido y notificado.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Remover',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#f5365c',
    }).then(result => {
      if (result.isConfirmed) {
        this.grupoService.remover(this.grupoId, miembro.usuarioId, this.usuarioActual).subscribe({
          next: () => {
            Swal.fire('Listo', 'Miembro removido del grupo', 'success');
            this.cargarMiembros();
          },
          error: err => Swal.fire('Error', err.error?.message || 'No se pudo remover al miembro', 'error'),
        });
      }
    });
  }

  bloquear(miembro: MembresiaGrupo): void {
    Swal.fire({
      title: `¿Bloquear a ${miembro.nombreUsuario || miembro.usuarioId}?`,
      text: 'El usuario no podrá volver a unirse a este grupo.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Bloquear',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#fb6340',
    }).then(result => {
      if (result.isConfirmed) {
        this.grupoService.bloquear(this.grupoId, miembro.usuarioId, this.usuarioActual).subscribe({
          next: () => {
            Swal.fire('Bloqueado', 'Usuario bloqueado del grupo', 'success');
            this.cargarMiembros();
          },
          error: err => Swal.fire('Error', err.error?.message || 'No se pudo bloquear al usuario', 'error'),
        });
      }
    });
  }

  toggleLogs(): void {
    this.verLogs = !this.verLogs;
    if (this.verLogs && this.logs.length === 0) {
      this.grupoService.obtenerLogs(this.grupoId).subscribe({
        next: logs => (this.logs = logs),
        error: err => console.error('Error cargando logs:', err),
      });
    }
  }
}
