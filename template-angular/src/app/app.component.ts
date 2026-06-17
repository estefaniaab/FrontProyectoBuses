import { Component, OnInit, HostListener } from '@angular/core';
import { ChatNotificationService } from './services/Chat-Notification/chat-notification.service';
import { SecurityService } from './services/security.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(
    private chatNotificationService: ChatNotificationService,
    private securityService: SecurityService
  ) {}

  ngOnInit(): void {
    const usuario = this.securityService.activeUserSession;
    if (usuario?.id) {
      this.chatNotificationService.conectar(usuario.id);
    }
  }

  @HostListener('document:click', ['$event'])
  habilitarSonido(): void {
    this.chatNotificationService.habilitarSonido();
  }
}
