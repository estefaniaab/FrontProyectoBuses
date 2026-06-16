// Agrega esto en el componente del navbar existente
// Si el navbar tiene su propio componente, añade estas propiedades y métodos

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { NotificacionService } from 'src/app/services/Grupo/notificacion.service';
import { Notificacion } from 'src/app/models/Grupos/grupo.model';

// ── Añadir estas propiedades al componente navbar existente ──────────────────

// notificaciones: Notificacion[] = [];
// noLeidas = 0;
// mostrarBandeja = false;
// private intervalSub?: Subscription;

// ── Añadir en ngOnInit ───────────────────────────────────────────────────────

// this.cargarNotificaciones();
// this.intervalSub = interval(30000).subscribe(() => this.contarNoLeidas());

// ── Añadir en ngOnDestroy ────────────────────────────────────────────────────

// this.intervalSub?.unsubscribe();

// ── Añadir estos métodos ─────────────────────────────────────────────────────

export class NavbarNotificacionesMixin {
  notificaciones: Notificacion[] = [];
  noLeidas = 0;
  mostrarBandeja = false;
  private intervalSub?: Subscription;

  get usuarioId(): string {
    const session = localStorage.getItem('session');
    return session ? JSON.parse(session)?.id ?? '' : '';
  }

  constructor(
    private notificacionService: NotificacionService,
    private router: Router,
  ) {}

  cargarNotificaciones(): void {
    if (!this.usuarioId) return;
    this.notificacionService.listarPorUsuario(this.usuarioId).subscribe({
      next: n => {
        this.notificaciones = n;
        this.noLeidas = n.filter(x => !x.leido).length;
      },
    });
  }

  contarNoLeidas(): void {
    if (!this.usuarioId) return;
    this.notificacionService.contarNoLeidas(this.usuarioId).subscribe({
      next: ({ count }) => (this.noLeidas = count),
    });
  }

  toggleBandeja(): void {
    this.mostrarBandeja = !this.mostrarBandeja;
    if (this.mostrarBandeja) this.cargarNotificaciones();
  }

  marcarLeida(notif: Notificacion): void {
    if (notif.leido) return;
    this.notificacionService.marcarLeida(notif.id!).subscribe({
      next: () => {
        notif.leido = true;
        this.noLeidas = Math.max(0, this.noLeidas - 1);
      },
    });
  }

  marcarTodasLeidas(): void {
    this.notificacionService.marcarTodasLeidas(this.usuarioId).subscribe({
      next: () => {
        this.notificaciones.forEach(n => (n.leido = true));
        this.noLeidas = 0;
      },
    });
  }

  irAlGrupo(notif: Notificacion): void {
    this.marcarLeida(notif);
    if (notif.referenciaId) {
      this.router.navigate(['/grupos/chat', notif.referenciaId]);
    }
    this.mostrarBandeja = false;
  }
}
