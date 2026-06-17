import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MensajesService } from 'src/app/services/Mensajes/mensajes.service';
import { SecurityService } from 'src/app/services/security.service';
import { Mensaje } from 'src/app/models/Mensaje/mensaje.model';
import { NotificacionService } from 'src/app/services/Grupo/notificacion.service';
import { Notificacion } from 'src/app/models/Grupos/grupo.model';

interface ItemBandeja {
  tipo: 'individual' | 'grupal' | 'alerta';
  id: string; // único por item
  titulo: string;
  preview: string;
  fecha: Date;
  leido: boolean;
  // individual
  mensajeIndividual?: Mensaje;
  emisorId?: string;
  // grupal/alerta
  notificacion?: Notificacion;

}

@Component({
  selector: 'app-bandeja-grupos',
  templateUrl: './bandeja.component.html',
  styleUrls: ['./bandeja.component.scss'],
})
export class BandejaComponent implements OnInit, OnDestroy {
  usuarioActual: any = null;
  items: ItemBandeja[] = [];
  itemsFiltrados: ItemBandeja[] = [];
  cargando = false;
  filtro: 'todos' | 'no_leidos' | 'individual' | 'grupal' | 'alerta' = 'todos';
  busqueda = '';
  fechaFiltro = '';

  // Búsqueda nuevo mensaje
  busquedaUsuario = '';
  usuariosBuscados: any[] = [];
  buscando = false;

  // Cache nombres
  usuariosCache: Map<string, any> = new Map();
  private usuariosSolicitados: Set<string> = new Set();

  private subs: Subscription[] = [];

  get noLeidos(): number {
    return this.items.filter(i => !i.leido).length;
  }

  constructor(
    private mensajesService: MensajesService,
    private notificacionService: NotificacionService,
    private securityService: SecurityService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.usuarioActual = this.securityService.activeUserSession;
    if (!this.usuarioActual?.id) return;

    this.mensajesService.conectar(this.usuarioActual.id);
    this.cargarTodo();

    this.subs.push(
      this.mensajesService.onMensajeRecibido().subscribe(() => this.cargarTodo())
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  cargarTodo(): void {
    this.cargando = true;
    const id = this.usuarioActual.id;
    const itemsTemp: ItemBandeja[] = [];
    let pendientes = 2;

    const check = () => {
      pendientes--;
      if (pendientes === 0) {
        this.items = itemsTemp.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
        this.aplicarFiltro();
        this.cargando = false;
      }
    };

    // Mensajes individuales recibidos
    this.mensajesService.getRecibidos(id).subscribe({
      next: data => {
        const agrupados = this.agruparPorRemitente(data);
        for (const msg of agrupados) {
          const leido = msg.destinatariosPersona?.some(
            d => d.usuarioId === id && d.leido
          ) ?? false;
          itemsTemp.push({
            tipo:               'individual',
            id:                 `ind-${msg.emisorId}`,
            titulo:             this.getNombreUsuario(msg.emisorId),
            preview:            msg.contenido?.substring(0, 80) ?? '',
            fecha:              new Date(msg.fechaEnvio),
            leido,
            mensajeIndividual:  msg,
            emisorId:           msg.emisorId,
          });
        }
        check();
      },
      error: () => check(),
    });

// Notificaciones grupales y alertas
    this.notificacionService.listarPorUsuario(id).subscribe({
      next: notifs => {
        const notifsPorGrupo = new Map<string, Notificacion>();

        for (const n of notifs) {
          const esAlerta = ['alerta_masiva', 'alerta_urgente'].includes(n.tipo);

          if (n.tipo === 'nuevo_mensaje') {
            // Agrupar por grupoId — solo la más reciente
            const key = `grupo-${n.referenciaId}`;
            const existente = notifsPorGrupo.get(key);
            if (!existente || new Date(n.fechaCreacion ?? '') > new Date(existente.fechaCreacion ?? '')) {
              notifsPorGrupo.set(key, n);
            }
          } else {
            // Resto sin agrupar
            itemsTemp.push({
              tipo:          esAlerta ? 'alerta' : 'grupal',
              id:            `notif-${n.id}`,
              titulo:        n.titulo,
              preview:       n.mensaje?.substring(0, 80) ?? '',
              fecha:         new Date(n.fechaCreacion ?? ''),
              leido:         n.leido,
              notificacion:  n,
            });
          }
        }

        // Agregar agrupados por grupo
        for (const n of notifsPorGrupo.values()) {
          itemsTemp.push({
            tipo:          'grupal',
            id:            `grupo-${n.referenciaId}`,
            titulo:        n.titulo,
            preview:       n.mensaje?.substring(0, 80) ?? '',
            fecha:         new Date(n.fechaCreacion ?? ''),
            leido:         n.leido,
            notificacion:  n,
          });
        }

        check();
      },
      error: () => check(),
    });

  }

  private agruparPorRemitente(mensajes: Mensaje[]): Mensaje[] {
    const porUsuario = new Map<string, Mensaje>();
    for (const msg of mensajes) {
      const existente = porUsuario.get(msg.emisorId);
      if (!existente || new Date(msg.fechaEnvio) > new Date(existente.fechaEnvio)) {
        porUsuario.set(msg.emisorId, msg);
      }
    }
    return Array.from(porUsuario.values())
      .sort((a, b) => new Date(b.fechaEnvio).getTime() - new Date(a.fechaEnvio).getTime());
  }

  aplicarFiltro(): void {
    let resultado = [...this.items];

    switch (this.filtro) {
      case 'no_leidos':   resultado = resultado.filter(i => !i.leido); break;
      case 'individual':  resultado = resultado.filter(i => i.tipo === 'individual'); break;
      case 'grupal':      resultado = resultado.filter(i => i.tipo === 'grupal'); break;
      case 'alerta':      resultado = resultado.filter(i => i.tipo === 'alerta'); break;
    }

    if (this.busqueda.trim()) {
      const term = this.busqueda.toLowerCase();
      resultado = resultado.filter(i =>
        i.titulo.toLowerCase().includes(term) || i.preview.toLowerCase().includes(term)
      );
    }

    // FIX: filtro por fecha dentro de aplicarFiltro
    if (this.fechaFiltro) {
      const [year, month, day] = this.fechaFiltro.split('-').map(Number);
      const fechaSeleccionada = new Date(year, month - 1, day, 0, 0, 0, 0);
      const fechaFin = new Date(year, month - 1, day, 23, 59, 59, 999);
      resultado = resultado.filter(i => i.fecha >= fechaSeleccionada && i.fecha <= fechaFin);
    }

    this.itemsFiltrados = resultado;
  }

  cambiarFiltro(filtro: any): void {
    this.filtro = filtro;
    this.aplicarFiltro(); // solo llama aplicarFiltro, sin código extra
  }



  abrir(item: ItemBandeja): void {
    if (item.tipo === 'individual' && item.emisorId) {
      this.router.navigate(['/mensajes/chat', item.emisorId]);
    } else if (item.notificacion) {
      this.notificacionService.marcarLeida(item.notificacion.id!).subscribe({
        next: () => { item.leido = true; if (item.notificacion) item.notificacion.leido = true; },
      });
      if (item.notificacion.referenciaId &&
        ['bienvenida_grupo','nuevo_mensaje','remocion_grupo','bloqueo_grupo'].includes(item.notificacion.tipo)) {
        this.router.navigate(['/grupos/chat', item.notificacion.referenciaId]);
      }
    }
  }

  marcarTodasLeidas(): void {
    this.notificacionService.marcarTodasLeidas(this.usuarioActual.id).subscribe({
      next: () => {
        this.items.forEach(i => { if (i.tipo !== 'individual') i.leido = true; });
        this.aplicarFiltro();
      },
    });
  }

  // ── Buscar usuario para nuevo mensaje ─────────────────────────────────────
  buscarUsuarios(): void {
    if (!this.busquedaUsuario.trim()) { this.usuariosBuscados = []; return; }
    this.buscando = true;
    this.mensajesService.buscarUsuarios(this.busquedaUsuario).subscribe({
      next: users => {
        this.usuariosBuscados = users.filter(u => u.id !== this.usuarioActual.id);
        this.buscando = false;
      },
      error: () => { this.buscando = false; },
    });
  }

  irAlChat(userId: string): void {
    this.busquedaUsuario = '';
    this.usuariosBuscados = [];
    this.router.navigate(['/mensajes/chat', userId]);
  }

  // ── Cache nombres ─────────────────────────────────────────────────────────
  cargarNombreUsuario(id: string): void {
    if (this.usuariosCache.has(id) || this.usuariosSolicitados.has(id)) return;
    this.usuariosSolicitados.add(id);
    this.mensajesService.getUserById(id).subscribe({
      next: user => {
        const e = this.usuariosCache.get(id) || {};
        this.usuariosCache.set(id, { ...e, name: user?.name || id });
      },
      error: () => {
        const e = this.usuariosCache.get(id) || {};
        this.usuariosCache.set(id, { ...e, name: id });
      }
    });
    this.mensajesService.getFotoPerfil(id).subscribe({
      next: res => {
        const e = this.usuariosCache.get(id) || {};
        this.usuariosCache.set(id, { ...e, photo: res?.photo || null });
      },
      error: () => {
        const e = this.usuariosCache.get(id) || {};
        this.usuariosCache.set(id, { ...e, photo: null });
      }
    });
  }

  getNombreUsuario(id: string): string {
    if (!id) return '';
    this.cargarNombreUsuario(id);
    return this.usuariosCache.get(id)?.name || id;
  }

  getFotoUsuario(id: string): string | null {
    if (!id) return null;
    this.cargarNombreUsuario(id);
    return this.usuariosCache.get(id)?.photo || null;
  }

  // ── Helpers visuales ──────────────────────────────────────────────────────
  iconoTipo(tipo: string): string {
    const iconos: Record<string, string> = {
      individual:        'person',
      grupal:            'group',
      alerta:            'campaign',
      bienvenida_grupo:  'group_add',
      salida_grupo:      'exit_to_app',
      remocion_grupo:    'person_remove',
      bloqueo_grupo:     'block',
      nuevo_mensaje:     'chat',
      alerta_masiva:     'campaign',
      alerta_urgente:    'warning',
    };
    return iconos[tipo] ?? 'notifications';
  }

  colorTipo(tipo: string): string {
    const colores: Record<string, string> = {
      individual:        '#fd7e14',
      grupal:            '#5e72e4',
      alerta:            '#f5365c',
      bienvenida_grupo:  '#2dce89',
      salida_grupo:      '#adb5bd',
      remocion_grupo:    '#f5365c',
      bloqueo_grupo:     '#fb6340',
      nuevo_mensaje:     '#5e72e4',
      alerta_masiva:     '#11cdef',
      alerta_urgente:    '#f5365c',
    };
    return colores[tipo] ?? '#adb5bd';
  }

  etiquetaTipo(item: ItemBandeja): string {
    if (item.tipo === 'individual') return 'Individual';
    if (item.tipo === 'alerta') return 'Alerta';
    if (item.notificacion) return item.notificacion.tipo.replace(/_/g, ' ');
    return 'Grupal';
  }
}
