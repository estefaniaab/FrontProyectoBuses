import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

declare interface RouteInfo {
  path: string;
  title: string;
  icon: string;
  class: string;
}
export const ROUTES: RouteInfo[] = [
  // ── Sistema ──────────────────────────────────────────────────────────────
  { path: '/dashboard',              title: 'Dashboard',        icon: 'ni-tv-2 text-primary',          class: '' },
  { path: '/users/list',             title: 'Usuarios',         icon: 'ni-single-02 text-yellow',      class: '' },
  { path: '/roles/list',             title: 'Roles',            icon: 'ni-badge text-blue',            class: '' },
  { path: '/permissions/list',       title: 'Permisos',         icon: 'ni-lock-circle-open text-red',  class: '' },
  { path: '/user-role/list',         title: 'Usuario-Rol',      icon: 'ni-bullet-list-67 text-orange', class: '' },
  { path: '/profiles/list',          title: 'Perfiles',         icon: 'ni-circle-08 text-pink',        class: '' },

  // ── Operación ─────────────────────────────────────────────────────────────
  { path: '/paraderos/list',         title: 'Paraderos',        icon: 'ni-pin-3 text-green',           class: '' },
  { path: '/rutas/list',             title: 'Rutas',            icon: 'ni-square-pin text-blue',       class: '' },
  { path: '/buses/list',             title: 'Buses',            icon: 'ni-send text-orange',           class: '' },
  { path: '/conductores/list',       title: 'Conductores',      icon: 'ni-circle-08 text-yellow',      class: '' },
  { path: '/turnos/list',            title: 'Turnos',           icon: 'ni-time-alarm text-red',        class: '' },
  { path: '/programaciones-ruta/list', title: 'Programaciones', icon: 'ni-calendar-grid-58 text-blue', class: '' },

  // ── Ciudadano ─────────────────────────────────────────────────────────────
  { path: '/ciudadanos/list',        title: 'Ciudadanos',       icon: 'ni-single-02 text-green',       class: '' },
  { path: '/boletos/list',           title: 'Boletos',          icon: 'ni-tag text-orange',            class: '' },
  { path: '/recargas/list',          title: 'Recargas',         icon: 'ni-money-coins text-green',     class: '' },

  // ── Reportes ──────────────────────────────────────────────────────────────
  { path: '/reportes/dashboard',     title: 'Reportes',         icon: 'ni-chart-bar-32 text-red',      class: '' },
];

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  public menuItems: any[];
  public isCollapsed = true;

  constructor(private router: Router) {}

  ngOnInit() {
    this.menuItems = ROUTES.filter(menuItem => menuItem);
    this.router.events.subscribe(() => {
      this.isCollapsed = true;
    });
  }
}
