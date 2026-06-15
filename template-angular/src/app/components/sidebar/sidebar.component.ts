import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { CiudadanoService } from 'src/app/services/Ciudadano/ciudadano.service';

declare interface RouteInfo {
  path: string;
  title: string;
  icon: string;
  class: string;
  key?: string;
}

export const ROUTES: RouteInfo[] = [
  { path: '/dashboard', title: 'Dashboard', icon: 'ni-tv-2 text-primary', class: ''},
  { path: '/dashboard-buses', title: 'Dashboard Buses', icon: 'ni-delivery-fast text-success', class: ''},
  // Seguridad
  { path: '/users/list', title: 'Usuarios', icon: 'ni-single-02 text-yellow', class: ''},
  { path: '/roles/list', title: 'Roles', icon: 'ni-badge text-blue', class: ''},
  { path: '/permissions/list', title: 'Permisos', icon: 'ni-lock-circle-open text-red', class: ''},
  { path: '/user-role/list', title: 'Usuario-Rol', icon: 'ni-bullet-list-67 text-orange', class: ''},
  { path: '/profiles/list', title: 'Perfiles', icon: 'ni-circle-08 text-pink', class: ''},
  // Operación
  { path: '/rutas/list', title: 'Rutas', icon: 'ni-map-big text-info', class: ''},
  { path: '/paraderos/list', title: 'Paraderos', icon: 'ni-square-pin text-red', class: ''},
  { path: '/paraderos/cercanos', title: 'Paraderos cercanos', icon: 'ni-compass-04 text-success', class: ''},
  { path: '/buses/list', title: 'Buses', icon: 'ni-delivery-fast text-primary', class: '' },
  { path: '/conductores/list', title: 'Conductores', icon: 'ni-badge text-warning', class: '' },
  { path: '/turnos/list', title: 'Turnos', icon: 'ni-time-alarm text-info', class: '' },
  { path: '/programaciones-ruta/list', title: 'Programaciones', icon: 'ni-calendar-grid-58 text-orange', class: '' },
  // Monitoreo
  { path: '/monitoreo/seguimiento', title: 'Monitoreo buses', icon: 'ni-pin-3 text-danger', class: ''},
  // Mensajería  ← NUEVO
  { path: '/mensajes', title: 'Mensajes', icon: 'ni-email-83 text-primary', class: ''},
  // Ciudadano / viajes
  { path: '/ciudadanos/list', title: 'Ciudadanos', icon: 'ni-single-02 text-success', class: ''},
  { path: '/boletos/list', title: 'Boletos', icon: 'ni-tag text-purple', class: '' },
  { path: '/recargas/create', title: 'Recargar tarjeta', icon: 'ni-credit-card text-blue', class: '' },
  { path: '/recargas/admin', title: 'Recargas Admin', icon: 'ni-money-coins text-green', class: ''},
  { path: '', title: 'Historial', icon: 'ni-collection text-info', class: '', key: 'MI_HISTORIAL'},
  { path: '/historial/admin', title: 'Historial Admin', icon: 'ni-collection text-default', class: ''},
  // Reportes
  { path: '/reportes/rangos-etarios', title: 'Rangos etarios', icon: 'ni-chart-pie-35 text-info', class: ''},
  { path: '/reportes/dashboard', title: 'Reportes', icon: 'ni-chart-bar-32 text-red', class: '' },
  { path: '/reportes/tendencia-incidentes', title: 'Tendencia incidentes', icon: 'ni-chart-bar-32 text-danger', class: '' },
];

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  public menuItems: RouteInfo[] = [];
  public isCollapsed = true;

  constructor(
    private router: Router,
    private ciudadanoService: CiudadanoService
  ) {}

  ngOnInit(): void {
    this.menuItems = ROUTES.filter(menuItem => menuItem);

    this.cargarRutaMiHistorial();

    this.router.events.subscribe(() => {
      this.isCollapsed = true;
    });
  }

  cargarRutaMiHistorial(): void {
    const usuarioId = this.getUsuarioIdLogueado();

    if (!usuarioId) {
      this.actualizarRutaMiHistorial('/historial/list');
      return;
    }

    this.ciudadanoService.findByUsuarioId(usuarioId).subscribe({
      next: (ciudadano) => {
        if (!ciudadano?.id) {
          this.actualizarRutaMiHistorial('/historial/list');
          return;
        }

        this.actualizarRutaMiHistorial(
          `/historial/admin/ciudadano/${ciudadano.id}`
        );
      },
      error: (error) => {
        console.error('Error cargando ciudadano del usuario logueado:', error);
        this.actualizarRutaMiHistorial('/historial/list');
      }
    });
  }

  actualizarRutaMiHistorial(path: string): void {
    this.menuItems = this.menuItems.map(item => {
      if (item.key === 'MI_HISTORIAL') {
        return {
          ...item,
          path
        };
      }

      return item;
    });
  }

  getUsuarioIdLogueado(): string | null {
    const sessionRaw = localStorage.getItem('session');

    if (!sessionRaw) {
      return null;
    }

    try {
      const session = JSON.parse(sessionRaw);

      if (session.id) {
        return session.id;
      }

      if (session.user?.id) {
        return session.user.id;
      }

      if (session.user?._id) {
        return session.user._id;
      }

      if (session.token) {
        const payload = JSON.parse(atob(session.token.split('.')[1]));

        return (
          payload.id ||
          payload.sub ||
          payload._id ||
          null
        );
      }

      return null;
    } catch (error) {
      console.error('Error leyendo session:', error);
      return null;
    }
  }
}
