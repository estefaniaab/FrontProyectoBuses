import { Component, OnInit, ElementRef, OnDestroy, HostListener } from '@angular/core';
import { ROUTES } from '../sidebar/sidebar.component';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { SecurityService } from '../../services/security.service';
import { User } from '../../models/Users/user.model';
import { Subscription } from 'rxjs';
import { ProfileService } from '../../services/Profile/profile.service';
import { Profile } from '../../models/Profiles/profile.model';
import { ChatNotificationService, NotificacionMensaje } from '../../services/Chat-Notification/chat-notification.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  public focus: boolean;
  public listTitles: any[] = [];
  public location: Location;

  currentUser: User | null = null;
  userSubscription!: Subscription;

  displayName: string = 'Usuario';
  profileImage: string = 'assets/img/theme/team-4-800x800.jpg';

  // Variables para notificaciones
  contadorNotificaciones = 0;
  listaNotificaciones: NotificacionMensaje[] = [];
  showNotificaciones = false;
  private notificacionSubscription!: Subscription;

  constructor(
    location: Location,
    private element: ElementRef,
    private router: Router,
    public securityService: SecurityService,
    private profileService: ProfileService,
    private chatNotificationService: ChatNotificationService
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
          if (profile?.photo && profile.photo.trim() !== '') {
            this.profileImage = profile.photo;
          } else {
            this.profileImage = 'assets/img/theme/team-4-800x800.jpg';
          }
        },
        error: () => {
          this.profileImage = 'assets/img/theme/team-4-800x800.jpg';
        }
      });

      // Conectar al servicio de notificaciones
      this.chatNotificationService.conectar(user.id);
      this.cargarNotificaciones();
    });
  }

  cargarNotificaciones(): void {
    this.listaNotificaciones = this.chatNotificationService.obtenerNotificaciones();
    this.contadorNotificaciones = this.chatNotificationService.obtenerNoLeidos();

    if (this.notificacionSubscription) {
      this.notificacionSubscription.unsubscribe();
    }

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
  cerrarNotificaciones(): void {
    this.showNotificaciones = false;
  }

  marcarTodasLeidas(): void {
    this.chatNotificationService.marcarTodosLeidos();
  }

  abrirNotificacion(notificacion: NotificacionMensaje): void {
    this.chatNotificationService.marcarComoLeido(notificacion.emisorId);
    this.router.navigate(['/mensajes/chat', notificacion.emisorId]);
    this.showNotificaciones = false;
  }

  goToMyProfile(): void {
    this.router.navigate(['/profiles/me']);
  }

  logout(): void {
    this.chatNotificationService.desconectar();
    this.securityService.logout();
  }

  getTitle() {
    let titlee = this.location.prepareExternalUrl(this.location.path());

    if (titlee.charAt(0) === '#') {
      titlee = titlee.slice(1);
    }

    for (let item = 0; item < this.listTitles.length; item++) {
      if (this.listTitles[item].path === titlee) {
        return this.listTitles[item].title;
      }
    }

    return 'Dashboard';
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.notificacionSubscription) {
      this.notificacionSubscription.unsubscribe();
    }
  }
}
