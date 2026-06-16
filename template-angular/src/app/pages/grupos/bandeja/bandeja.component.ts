import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { NotificacionService } from 'src/app/services/Grupo/notificacion.service';
import { Notificacion } from 'src/app/models/Grupos/grupo.model';

interface MensajeBandeja {
  grupoId: number;
  grupoNombre: string;
  ultimoMensaje: string;
  emisor: string;
  fecha: string;
  noLeidos: number;
}

@Component({
  selector: 'app-bandeja-grupos',
  templateUrl: './bandeja.component.html',
  styleUrls: ['./bandeja.component.scss'],
})
export class BandejaComponent implements OnInit {
  // HU-ENTR-3-007: notificaciones y filtros
  notificaciones: Notificacion[] = [];
  notificacionesFiltradas: Notificacion[] = [];
  filtro: 'todos' | 'no_leidos' | 'grupo' | 'alerta' = 'todos';
  busqueda = '';
  cargando = false;

  get usuarioActual(): string {
    const session = localStorage.getItem('session');
    return session ? JSON.parse(session)?.id ?? '' : '';
  }

  constructor(
    private router: Router,
    private notificacionService: NotificacionService,
  ) {}

  ngOnInit(): void {
    this.cargarNotificaciones();
  }

  cargarNotificaciones(): void {
    this.cargando = true;
    this.notificacionService.listarPorUsuario(this.usuarioActual).subscribe({
      next: notifs => {
        this.notificaciones = notifs;
        this.aplicarFiltro();
        this.cargando = false;
      },
      error: () => { this.cargando = false; },
    });
  }

  aplicarFiltro(): void {
    let resultado = [...this.notificaciones];

    switch (this.filtro) {
      case 'no_leidos':
        resultado = resultado.filter(n => !n.leido);
        break;
      case 'grupo':
        resultado = resultado.filter(n =>
          ['bienvenida_grupo','salida_grupo','remocion_grupo','bloqueo_grupo','nuevo_mensaje'].includes(n.tipo)
        );
        break;
      case 'alerta':
        resultado = resultado.filter(n => ['alerta_masiva','alerta_urgente'].includes(n.tipo));
        break;
    }

    if (this.busqueda.trim()) {
      const term = this.busqueda.toLowerCase();
      resultado = resultado.filter(n =>
        n.titulo.toLowerCase().includes(term) || n.mensaje.toLowerCase().includes(term)
      );
    }

    this.notificacionesFiltradas = resultado;
  }

  cambiarFiltro(filtro: 'todos' | 'no_leidos' | 'grupo' | 'alerta'): void {
    this.filtro = filtro;
    this.aplicarFiltro();
  }

  abrir(notif: Notificacion): void {
    if (!notif.leido) {
      this.notificacionService.marcarLeida(notif.id!).subscribe({
        next: () => { notif.leido = true; },
      });
    }

    if (notif.referenciaId && ['bienvenida_grupo','nuevo_mensaje','remocion_grupo','bloqueo_grupo'].includes(notif.tipo)) {
      this.router.navigate(['/grupos/chat', notif.referenciaId]);
    }
  }

  marcarTodasLeidas(): void {
    this.notificacionService.marcarTodasLeidas(this.usuarioActual).subscribe({
      next: () => {
        this.notificaciones.forEach(n => (n.leido = true));
        this.aplicarFiltro();
      },
    });
  }

  get noLeidas(): number {
    return this.notificaciones.filter(n => !n.leido).length;
  }

  iconoTipo(tipo: string): string {
    const iconos: Record<string, string> = {
      bienvenida_grupo: 'group_add',
      salida_grupo:     'exit_to_app',
      remocion_grupo:   'person_remove',
      bloqueo_grupo:    'block',
      nuevo_mensaje:    'chat',
      alerta_masiva:    'campaign',
      alerta_urgente:   'warning',
    };
    return iconos[tipo] ?? 'notifications';
  }

  colorTipo(tipo: string): string {
    const colores: Record<string, string> = {
      bienvenida_grupo: '#2dce89',
      salida_grupo:     '#adb5bd',
      remocion_grupo:   '#f5365c',
      bloqueo_grupo:    '#fb6340',
      nuevo_mensaje:    '#5e72e4',
      alerta_masiva:    '#11cdef',
      alerta_urgente:   '#f5365c',
    };
    return colores[tipo] ?? '#adb5bd';
  }
}
