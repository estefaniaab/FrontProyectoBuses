import { Injectable, NgZone } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  private messaging = getMessaging(initializeApp(environment.firebase));

  constructor(
    private router: Router,
    private ngZone: NgZone
  ) {}

  async obtenerFcmToken(): Promise<string | null> {
    try {
      const registration = await navigator.serviceWorker.register('/assets/firebase-messaging-sw.js');
      const token = await getToken(this.messaging, {
        vapidKey: environment.firebase.vapidKey,
        serviceWorkerRegistration: registration
      });
      console.log('Token obtenido:', token);
      return token;
    } catch (error) {
      console.error('Error obteniendo token FCM:', error);
      return null;
    }
  }

  // 🔥 Escuchar mensajes solo para logging, sin mostrar notificación en primer plano
  escucharMensajes(callback: (payload: any) => void): void {
    onMessage(this.messaging, (payload) => {
      console.log('Mensaje recibido en primer plano (solo para información):', payload);

      // No mostrar notificación en primer plano
      // Solo ejecutar el callback si es necesario
      callback(payload);
    });
  }
}
