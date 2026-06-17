import { Component, OnInit, ElementRef, OnDestroy, HostListener } from '@angular/core';
import { ROUTES } from '../sidebar/sidebar.component';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { SecurityService } from '../../services/security.service';
import { User } from '../../models/Users/user.model';
import { interval, Subscription } from 'rxjs';
import { ProfileService } from '../../services/Profile/profile.service';
import { Profile } from '../../models/Profiles/profile.model';
import { ChatNotificationService, NotificacionMensaje } from '../../services/Chat-Notification/chat-notification.service';
import { NotificacionService } from '../../services/Grupo/notificacion.service';
import { Notificacion } from '../../models/Grupos/grupo.model';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  public focus: boolean = false;
  public listTitles: any[] = [];
  public location: Location;

  currentUser: User | null = null;
  userSubscription!: Subscription;
  private intervalSub?: Subscription;
  private notificacionSubscription!: Subscription;

  displayName: string = 'Usuario';
  profileImage: string = 'assets/img/theme/team-4-800x800.jpg';

  // ── Notificaciones grupos ─────────────────────────────────────────────────
  notificaciones: Notificacion[] = [];
  noLeidas = 0;
  mostrarBandeja = false;

  // ── Notificaciones chat ───────────────────────────────────────────────────
  contadorNotificaciones = 0;
  listaNotificaciones: NotificacionMensaje[] = [];
  showNotificaciones = false;

  get usuarioId(): string {
    const session = localStorage.getItem('session');
    return session ? JSON.parse(session)?.id ?? '' : '';
  }

  get token(): string {
    const session = localStorage.getItem('session');
    return session ? `Bearer ${JSON.parse(session)?.token ?? ''}` : '';
  }

  constructor(
    location: Location,
    private element: ElementRef,
    private router: Router,
    private http: HttpClient,
    public securityService: SecurityService,
    private profileService: ProfileService,
    private notificacionService: NotificacionService,
    private chatNotificationService: ChatNotificationService,
  ) {
    this.location = location;
  }

  ngOnInit() {
    this.listTitles = ROUTES.filter(listTitle => listTitle);

    this.userSubscription = this.securityService.theUser.subscribe((user: User) => {
      if (!user || !user.id) return;

      this.currentUser = user;
      this.displayName = user.githubUsername && user.githubUsername.trim() !== ''
        ? user.githubUsername
        : (user.name || 'Usuario');

      this.profileService.getMyProfile().subscribe({
        next: (profile: Profile) => {
          this.profileImage = profile?.photo?.trim()
            ? profile.photo
            : 'assets/img/theme/team-4-800x800.jpg';
        },
        error: () => { this.profileImage = 'assets/img/theme/team-4-800x800.jpg'; }
      });

      this.chatNotificationService.conectar(user.id);
      this.cargarNotificacionesChat();

      this.contarNoLeidas();
      this.intervalSub = interval(10000).subscribe(() => this.contarNoLeidas());
    });
  }

  // ── Notificaciones grupos ─────────────────────────────────────────────────

  contarNoLeidas(): void {
    if (!this.usuarioId) return;
    this.notificacionService.contarNoLeidas(this.usuarioId).subscribe({
      next: ({ count }) => {
        if (count !== this.noLeidas) {
          this.cargarNotificaciones();
        }
        this.noLeidas = count;
      },
      error: () => {},
    });
  }

  cargarNotificaciones(): void {
    if (!this.usuarioId) return;
    this.notificacionService.listarPorUsuario(this.usuarioId).subscribe({
      next: n => {
        const nuevasUrgentes = n.filter(x =>
          !x.leido &&
          x.tipo === 'alerta_urgente' &&
          !this.notificaciones.find(old => old.id === x.id)
        );

        this.notificaciones = n;
        this.noLeidas = n.filter(x => !x.leido).length;

        if (nuevasUrgentes.length > 0) {
          this.reproducirSonidoAlerta();
        }
      },
      error: () => {},
    });
  }

  private reproducirSonidoAlerta(): void {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, ctx.currentTime);
      oscillator.frequency.setValueAtTime(660, ctx.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(880, ctx.currentTime + 0.2);
      oscillator.frequency.setValueAtTime(440, ctx.currentTime + 0.3);

      gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.5);
    } catch {}
  }

  toggleBandeja(): void {
    this.mostrarBandeja = !this.mostrarBandeja;
    if (this.mostrarBandeja) this.cargarNotificaciones();
  }

  cerrarBandeja(): void { this.mostrarBandeja = false; }

  marcarLeida(notif: Notificacion): void {
    if (notif.leido || !notif.id) return;
    this.notificacionService.marcarLeida(notif.id).subscribe({
      next: () => { notif.leido = true; this.noLeidas = Math.max(0, this.noLeidas - 1); },
      error: () => {},
    });
  }

  marcarTodasLeidas(): void {
    this.notificacionService.marcarTodasLeidas(this.usuarioId).subscribe({
      next: () => { this.notificaciones.forEach(n => (n.leido = true)); this.noLeidas = 0; },
      error: () => {},
    });
  }

  irAlGrupo(notif: Notificacion): void {
    this.marcarLeida(notif);

    if (['alerta_masiva', 'alerta_urgente'].includes(notif.tipo)) {
      if (notif.referenciaId) {
        this.http.patch(
          `${environment.url_ms_business}/alertas/${notif.referenciaId}/leido`,
          {},
          { headers: { Authorization: this.token } }
        ).subscribe({ error: () => {} });
      }
      this.router.navigate(['/grupos/alertas']);
    } else if (['nuevo_mensaje', 'bienvenida_grupo', 'remocion_grupo', 'bloqueo_grupo'].includes(notif.tipo)) {
      this.router.navigate(['/grupos/chat', notif.referenciaId]);
    } else {
      this.router.navigate(['/grupos/bandeja']);
    }
    this.mostrarBandeja = false;
  }

  iconoNotificacion(tipo: string): string {
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

  colorNotificacion(tipo: string): string {
    const colores: Record<string, string> = {
      bienvenida_grupo: '#2dce89',
      salida_grupo:     '#adb5bd',
      remocion_grupo:   '#f5365c',
      bloqueo_grupo:    '#fb6340',
      nuevo_mensaje:    '#5e72e4',
      alerta_masiva:    '#11cdef',
      alerta_urgente:   '#f5365c',
    };
    return colores[tipo] ?? '#5e72e4';
  }

  // ── Notificaciones chat ───────────────────────────────────────────────────

  cargarNotificacionesChat(): void {
    this.listaNotificaciones = this.chatNotificationService.obtenerNotificaciones();
    this.contadorNotificaciones = this.chatNotificationService.obtenerNoLeidos();

    if (this.notificacionSubscription) this.notificacionSubscription.unsubscribe();

    this.notificacionSubscription = this.chatNotificationService.onNotificaciones().subscribe(() => {
      this.listaNotificaciones = this.chatNotificationService.obtenerNotificaciones();
      this.contadorNotificaciones = this.chatNotificationService.obtenerNoLeidos();
    });
  }

  toggleNotificaciones(event: Event): void {
    event.stopPropagation();
    this.showNotificaciones = !this.showNotificaciones;
  }

  @HostListener('document:click')
  cerrarNotificaciones(): void { this.showNotificaciones = false; }

  marcarTodasLeidasChat(): void { this.chatNotificationService.marcarTodosLeidos(); }

  abrirNotificacion(notificacion: NotificacionMensaje): void {
    this.chatNotificationService.marcarComoLeido(notificacion.emisorId);
    this.router.navigate(['/mensajes/chat', notificacion.emisorId]);
    this.showNotificaciones = false;
  }

  // ── Métodos originales ────────────────────────────────────────────────────

  goToMyProfile(): void { this.router.navigate(['/profiles/me']); }

  logout(): void {
    this.chatNotificationService.desconectar();
    this.securityService.logout();
  }

  getTitle() {
    let titlee = this.location.prepareExternalUrl(this.location.path());
    if (titlee.charAt(0) === '#') titlee = titlee.slice(1);
    for (let item = 0; item < this.listTitles.length; item++) {
      if (this.listTitles[item].path === titlee) return this.listTitles[item].title;
    }
    return 'Dashboard';
  }

  ngOnDestroy(): void {
    if (this.userSubscription) this.userSubscription.unsubscribe();
    if (this.intervalSub) this.intervalSub.unsubscribe();
    if (this.notificacionSubscription) this.notificacionSubscription.unsubscribe();
  }
}
