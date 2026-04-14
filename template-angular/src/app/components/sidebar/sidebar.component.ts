import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

declare interface RouteInfo {
  path: string;
  title: string;
  icon: string;
  class: string;
}
export const ROUTES: RouteInfo[] = [
  { path: '/dashboard',        title: 'Dashboard',    icon: 'ni-tv-2 text-primary',        class: '' },
  { path: '/users/list',       title: 'Usuarios',     icon: 'ni-single-02 text-yellow',    class: '' },
  { path: '/roles/list',       title: 'Roles',        icon: 'ni-badge text-blue',          class: '' },
  { path: '/permissions/list', title: 'Permisos',     icon: 'ni-lock-circle-open text-red',class: '' },
  { path: '/user-role/list',   title: 'Usuario-Rol',  icon: 'ni-bullet-list-67 text-orange',class: '' },
  { path: '/profiles/list',    title: 'Perfiles',     icon: 'ni-circle-08 text-pink',      class: '' },
  { path: '/icons',            title: 'Icons',        icon: 'ni-planet text-blue',         class: '' },
  { path: '/user-profile',     title: 'User profile', icon: 'ni-settings-gear-65 text-gray',class: '' },
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
