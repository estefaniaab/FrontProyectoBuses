import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UbicacionBusActiva {
  busId: number;
  placa: string;
  latitud: number | null;
  longitud: number | null;
  velocidad: number | null;
  rumbo: number | null;
  ultimaActualizacion: string | null;
  enRuta: boolean;
  ruta?: { id: number; nombre: string };
  paraderoMasCercano?: { id: number; nombre: string; distanciaKm: number } | null;
  retrasado?: boolean;
  retrasoMinutos?: number;
}

@Injectable({ providedIn: 'root' })
export class MonitoreoSocketService {
  private socket: Socket;

  constructor() {
    // Tomamos solo el origen (protocolo + host + puerto), por si
    // url_ms_business incluye un prefijo de path (ej: /api).
    const baseUrl = new URL(environment.url_ms_business).origin;

    this.socket = io(`${baseUrl}/monitoreo`, {
      transports: ['websocket'],
    });
  }

  onUbicaciones(): Observable<UbicacionBusActiva[]> {
    return new Observable((observer) => {
      const handler = (data: UbicacionBusActiva[]) => observer.next(data);
      this.socket.on('ubicaciones', handler);

      return () => {
        this.socket.off('ubicaciones', handler);
      };
    });
  }

  disconnect(): void {
    this.socket.disconnect();
  }
}
