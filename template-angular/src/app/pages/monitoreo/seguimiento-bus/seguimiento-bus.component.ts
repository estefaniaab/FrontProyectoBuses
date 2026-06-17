import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  NgZone,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as L from 'leaflet';
import Swal from 'sweetalert2';

import { MonitoreoService } from 'src/app/services/monitoreo/monitoreo.service';
import { RutaService } from 'src/app/services/ruta/ruta.service';
import { NodoService } from 'src/app/services/Nodo/nodo.service';
import { FirebaseService } from 'src/app/services/Firebase/firebase.service';
import { NotificacionesService } from 'src/app/services/Notificaciones/notificaciones.service';
import { SecurityService } from 'src/app/services/security.service';
import { CiudadanoService } from 'src/app/services/Ciudadano/ciudadano.service';

const iconDefault = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-seguimiento-bus',
  templateUrl: './seguimiento-bus.component.html',
  styleUrls: ['./seguimiento-bus.component.scss']
})
export class SeguimientoBusComponent implements OnInit, AfterViewInit, OnDestroy {

  cargando = false;
  ubicaciones: any[] = [];
  rutas: any[] = [];
  rutaSeleccionada: number | null = null;

  miLatitud: number | null = null;
  miLongitud: number | null = null;
  paraderoMasCercanoAMi: any = null;

  suscripcionActiva: any = null;
  cargandoSuscripcion = false;

  private map!: L.Map;
  private markers: L.Marker[] = [];
  private marcadoresParaderos: L.Marker[] = [];
  private lineaRuta?: L.Polyline;
  private markerUsuario?: L.Marker;
  private nodosRutaActual: any[] = [];
  private intervalId: any;
  private watchId: number | null = null;
  private mapaInicializado = false;

  constructor(
    private monitoreoService: MonitoreoService,
    private rutaService: RutaService,
    private nodoService: NodoService,
    private firebaseService: FirebaseService,
    private notificacionesService: NotificacionesService,
    private securityService: SecurityService,
    private ciudadanoService: CiudadanoService,
    private route: ActivatedRoute,
    private zone: NgZone,
  ) {}

  ngOnInit(): void {
    this.cargarRutas();
    this.escucharNotificacionesPrimerPlano();

    this.route.queryParams.subscribe(params => {
      const rutaId = params['rutaId'];
      if (rutaId) {
        setTimeout(() => {
          this.rutaSeleccionada = Number(rutaId);
          this.onRutaChange();
        }, 1000);
      }
    });
  }

  ngAfterViewInit(): void {
    this.inicializarMapa();
    this.iniciarGeolocalizacion();

    this.intervalId = setInterval(() => {
      if (this.rutaSeleccionada && this.mapaInicializado) {
        this.cargarUbicacionesPorRuta();
      }
    }, 10000);
  }

  ngOnDestroy(): void {
    this.mapaInicializado = false;
    if (this.map) this.map.remove();
    if (this.intervalId) clearInterval(this.intervalId);
    if (this.watchId !== null) navigator.geolocation.clearWatch(this.watchId);
  }

  private escucharNotificacionesPrimerPlano(): void {
    this.firebaseService.escucharMensajes((payload) => {
      this.zone.run(() => {
        const titulo = payload?.notification?.title || '🚌 Bus próximo';
        const cuerpo = payload?.notification?.body || '';
        const data = payload?.data || {};

        Swal.fire({
          title: titulo,
          text: cuerpo,
          icon: 'info',
          confirmButtonText: 'Ver en mapa',
          showCancelButton: true,
          cancelButtonText: 'Cerrar',
        }).then((result) => {
          if (result.isConfirmed && data.busId) {
            const params = new URLSearchParams({
              busId: data.busId,
              rutaId: data.rutaId,
              paraderoId: data.paraderoId,
              etaMinutos: data.etaMinutos,
              placa: data.placa,
              nombreRuta: data.nombreRuta || '',
            });
            window.location.href = `/#/alerta-bus?${params.toString()}`;
          }
        });
      });
    });
  }

  private async resolverCiudadanoId(): Promise<number | null> {
    let usuarioId: string | null = null;

    const userRaw = localStorage.getItem('user');
    if (userRaw) {
      try {
        const user = JSON.parse(userRaw);
        usuarioId = user?.id || null;
      } catch { }
    }

    if (!usuarioId) {
      const sessionRaw = localStorage.getItem('session');
      if (sessionRaw) {
        try {
          const session = JSON.parse(sessionRaw);
          if (session?.id) {
            usuarioId = session.id;
          } else if (session?.token) {
            const payload = JSON.parse(atob(session.token.split('.')[1]));
            usuarioId = payload.id || payload.sub || null;
          }
        } catch { }
      }
    }

    if (!usuarioId) return null;

    return new Promise((resolve) => {
      this.ciudadanoService.findByUsuarioId(usuarioId).subscribe({
        next: (ciudadano) => resolve(ciudadano?.id || null),
        error: () => resolve(null),
      });
    });
  }

  async activarNotificacion(): Promise<void> {
    if (!this.rutaSeleccionada || !this.paraderoMasCercanoAMi?.id) {
      Swal.fire(
        'Atención',
        'Selecciona una ruta y espera a que se detecte tu paradero más cercano.',
        'warning'
      );
      return;
    }

    const ciudadanoId = await this.resolverCiudadanoId();

    if (!ciudadanoId) {
      Swal.fire('Error', 'No se pudo identificar al ciudadano. Inicia sesión nuevamente.', 'error');
      return;
    }

    const { value: minutosAnticipacion } = await Swal.fire({
      title: '¿Con cuánta anticipación deseas ser notificado?',
      input: 'radio',
      inputOptions: {
        '5': '5 minutos antes',
        '10': '10 minutos antes',
        '15': '15 minutos antes',
      },
      inputValue: '5',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Activar notificación',
    });

    if (!minutosAnticipacion) return;

    this.cargandoSuscripcion = true;

    try {
      const fcmToken = await this.firebaseService.obtenerFcmToken();

      if (!fcmToken) {
        Swal.fire('Error', 'No se pudo obtener el token de notificaciones.', 'error');
        this.cargandoSuscripcion = false;
        return;
      }

      this.notificacionesService.suscribirse({
        ciudadanoId: Number(ciudadanoId),
        rutaId: this.rutaSeleccionada,
        paraderoId: this.paraderoMasCercanoAMi.id,
        fcmToken,
        minutosAnticipacion: Number(minutosAnticipacion),
      }).subscribe({
        next: (suscripcion) => {
          this.suscripcionActiva = suscripcion;
          this.cargandoSuscripcion = false;
          Swal.fire({
            title: '✅ Notificación activada',
            html: `Te avisaremos cuando el bus esté a <strong>${minutosAnticipacion} minutos</strong> de <strong>${this.paraderoMasCercanoAMi.nombre}</strong>.`,
            icon: 'success',
            timer: 3000,
            showConfirmButton: false,
          });
        },
        error: () => {
          this.cargandoSuscripcion = false;
          Swal.fire('Error', 'No se pudo activar la notificación.', 'error');
        }
      });
    } catch {
      this.cargandoSuscripcion = false;
      Swal.fire('Error', 'Ocurrió un error al activar la notificación.', 'error');
    }
  }

  cancelarNotificacion(): void {
    if (!this.suscripcionActiva?.id) return;

    this.notificacionesService.cancelarSuscripcion(this.suscripcionActiva.id).subscribe({
      next: () => {
        this.suscripcionActiva = null;
        Swal.fire({
          title: 'Notificación cancelada',
          icon: 'info',
          timer: 2000,
          showConfirmButton: false,
        });
      },
      error: () => Swal.fire('Error', 'No se pudo cancelar la notificación.', 'error')
    });
  }

  iniciarGeolocalizacion(): void {
    if (!navigator.geolocation) return;

    this.watchId = navigator.geolocation.watchPosition(
      (pos) => {
        this.zone.run(() => {
          this.miLatitud = pos.coords.latitude;
          this.miLongitud = pos.coords.longitude;
          this.actualizarMarcadorUsuario();

          if (this.rutaSeleccionada && this.nodosRutaActual.length > 0 && this.mapaInicializado) {
            const anteriorId = this.paraderoMasCercanoAMi?.id;
            this.recalcularParaderoCercano();
            if (this.paraderoMasCercanoAMi?.id !== anteriorId) {
              this.cargarUbicacionesPorRuta();
            }
          }
        });
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 }
    );
  }

  private actualizarMarcadorUsuario(): void {
    if (!this.mapaInicializado || !this.map) return;
    if (this.miLatitud === null || this.miLongitud === null) return;

    const latlng = L.latLng(this.miLatitud, this.miLongitud);

    if (this.markerUsuario) {
      this.markerUsuario.setLatLng(latlng);
    } else {
      const icon = L.divIcon({
        className: '',
        html: `<div style="
          width:16px; height:16px;
          background:#3b82f6;
          border:3px solid white;
          border-radius:50%;
          box-shadow:0 0 0 3px rgba(59,130,246,0.4);
        "></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
      this.markerUsuario = L.marker(latlng, { icon, zIndexOffset: 1000 })
        .addTo(this.map)
        .bindPopup('<strong>📍 Tu ubicación</strong>');
    }
  }

  private recalcularParaderoCercano(): void {
    if (this.miLatitud === null || this.miLongitud === null) return;
    if (this.nodosRutaActual.length === 0) return;

    let menorDist = Infinity;
    let cercano: any = null;

    this.nodosRutaActual.forEach((n: any) => {
      if (!n.paradero?.latitud || !n.paradero?.longitud) return;
      const dist = this.calcularDistanciaKm(
        this.miLatitud!, this.miLongitud!,
        Number(n.paradero.latitud), Number(n.paradero.longitud)
      );
      if (dist < menorDist) {
        menorDist = dist;
        cercano = n.paradero;
      }
    });

    this.paraderoMasCercanoAMi = cercano;
  }

  private calcularDistanciaKm(
    lat1: number, lng1: number,
    lat2: number, lng2: number
  ): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2
      + Math.cos(lat1 * Math.PI / 180)
      * Math.cos(lat2 * Math.PI / 180)
      * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  cargarRutas(): void {
    this.rutaService.list().subscribe({
      next: (data) => { this.rutas = data || []; },
      error: () => Swal.fire('Error', 'No se pudieron cargar las rutas.', 'error')
    });
  }

  onRutaChange(): void {
    this.limpiarMarkers();
    this.limpiarParaderos();
    this.paraderoMasCercanoAMi = null;
    this.nodosRutaActual = [];
    this.ubicaciones = [];
    this.suscripcionActiva = null;

    if (!this.rutaSeleccionada) return;

    this.cargarParaderosRuta(this.rutaSeleccionada);
  }

  inicializarMapa(): void {
    setTimeout(() => {
      const mapElement = document.getElementById('mapa-buses');
      if (!mapElement) return;

      this.map = L.map('mapa-buses', {
        center: [5.0569, -75.4870],
        zoom: 13,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(this.map);

      this.mapaInicializado = true;
      setTimeout(() => this.map.invalidateSize(), 200);
    }, 100);
  }

  cargarParaderosRuta(rutaId: number): void {
    this.nodoService.getByRuta(rutaId).subscribe({
      next: (nodos) => {
        this.nodosRutaActual = nodos
          .filter((n: any) => n.paradero?.latitud != null)
          .sort((a: any, b: any) => (a.orden ?? 0) - (b.orden ?? 0));

        this.pintarParaderos(this.nodosRutaActual);
        this.recalcularParaderoCercano();
        this.cargarUbicacionesPorRuta();
      },
      error: () => {}
    });
  }

  pintarParaderos(nodos: any[]): void {
    if (!this.mapaInicializado || !this.map) return;

    this.limpiarParaderos();
    if (nodos.length === 0) return;

    const posiciones: L.LatLngExpression[] = nodos.map((n: any) => [
      Number(n.paradero.latitud), Number(n.paradero.longitud),
    ]);

    this.lineaRuta = L.polyline(posiciones, {
      color: '#5e72e4', weight: 4, opacity: 0.7, dashArray: '8, 6',
    }).addTo(this.map);

    nodos.forEach((nodo: any, idx: number) => {
      const paradero = nodo.paradero;
      const esInicio = idx === 0;
      const esFin = idx === nodos.length - 1;
      const bgColor = esInicio ? '#2dce89' : esFin ? '#f5365c' : '#5e72e4';

      const icon = L.divIcon({
        className: '',
        html: `<div style="
          width:28px; height:28px; background:${bgColor};
          border:2px solid white; border-radius:50%;
          display:flex; align-items:center; justify-content:center;
          font-weight:800; font-size:11px; color:white;
          box-shadow:0 2px 6px rgba(0,0,0,0.3);">
          ${nodo.orden}
        </div>`,
        iconSize: [28, 28], iconAnchor: [14, 14],
      });

      const marker = L.marker(
        [Number(paradero.latitud), Number(paradero.longitud)], { icon }
      )
        .addTo(this.map)
        .bindPopup(`<strong>${nodo.orden}. ${paradero.nombre}</strong>`);

      this.marcadoresParaderos.push(marker);
    });

    this.map.fitBounds(this.lineaRuta.getBounds(), { padding: [40, 40] });
  }

  limpiarParaderos(): void {
    if (!this.mapaInicializado || !this.map) return;

    if (this.lineaRuta) {
      this.map.removeLayer(this.lineaRuta);
      this.lineaRuta = undefined;
    }
    this.marcadoresParaderos.forEach(m => m?.remove());
    this.marcadoresParaderos = [];
  }

  cargarUbicacionesPorRuta(): void {
    if (!this.rutaSeleccionada) return;
    if (!this.mapaInicializado || !this.map) return;

    this.cargando = true;

    this.monitoreoService.obtenerActivosPorRuta(this.rutaSeleccionada).subscribe({
      next: async (data) => {
        const busesConEta = await Promise.all(
          (data || []).map(async (bus: any) => {
            if (!this.paraderoMasCercanoAMi?.id) return { ...bus, eta: null };
            try {
              const eta = await this.monitoreoService
                .calcularEta(bus.busId, this.paraderoMasCercanoAMi.id)
                .toPromise();
              return { ...bus, eta: eta?.etaMinutos ?? null };
            } catch {
              return { ...bus, eta: null };
            }
          })
        );

        this.ubicaciones = busesConEta;
        this.pintarBuses();
        this.cargando = false;
      },
      error: (error) => {
        this.cargando = false;
        Swal.fire('Error', error.error?.message || 'No se pudieron cargar los buses.', 'error');
      }
    });
  }

  pintarBuses(): void {
    if (!this.mapaInicializado || !this.map) return;
    if (!this.map.getContainer()) return;
    if (!document.getElementById('mapa-buses')) return;

    this.limpiarMarkers();
    if (this.ubicaciones.length === 0) return;

    const grupos = new Map<string, any[]>();

    this.ubicaciones.forEach((bus: any) => {
      if (bus.latitud == null || bus.longitud == null) return;
      const lat = Number(bus.latitud);
      const lng = Number(bus.longitud);
      if (isNaN(lat) || isNaN(lng)) return;

      const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
      if (!grupos.has(key)) grupos.set(key, []);
      grupos.get(key)!.push({ ...bus, lat, lng });
    });

    grupos.forEach((busesCercanos) => {
      const { lat, lng } = busesCercanos[0];

      const etiquetas = busesCercanos.map(b => `
        <div style="
          background:white;
          border: 2px solid ${b.retrasado ? '#f5365c' : '#2dce89'};
          border-radius:4px; padding:1px 6px;
          font-size:10px; font-weight:bold;
          color:${b.retrasado ? '#f5365c' : '#2dce89'};
          white-space:nowrap; box-shadow:0 1px 4px rgba(0,0,0,.2);
          text-align:center; line-height:16px;
        ">${b.placa || 'N/A'}</div>
      `).join('');

      const colorIcono = busesCercanos.some(b => b.retrasado) ? '#f5365c' : '#2dce89';

      const icon = L.divIcon({
        className: '',
        html: `
          <div style="display:flex; flex-direction:column; align-items:center; gap:2px;">
            ${etiquetas}
            <div style="
              width:36px; height:36px; background:${colorIcono};
              border:3px solid white; border-radius:50%;
              display:flex; align-items:center; justify-content:center;
              color:white; font-size:16px;
              box-shadow:0 2px 8px rgba(0,0,0,.3);">🚌</div>
          </div>`,
        iconSize: [70, 20 * busesCercanos.length + 40],
        iconAnchor: [35, 20 * busesCercanos.length + 36],
      });

      const popupContent = busesCercanos.map(b => `
        <div style="border-bottom:1px solid #eee; padding:8px 0;">
          <strong>🚌 ${b.placa}</strong><br>
          <span>Velocidad: ${b.velocidad || 0} km/h</span><br>
          <span>📍 Cerca de: ${b.paraderoMasCercano?.nombre || 'N/D'}</span><br>
          <span>Estado: ${b.retrasado ? '🔴 Detenido' : '🟢 En movimiento'}</span>
          ${this.paraderoMasCercanoAMi ? `
            <div style="margin-top:6px; padding:6px 8px; background:#f0f4ff; border-radius:6px; border-left:3px solid #5e72e4;">
              <span>Tu paradero más cercano:</span><br>
              <strong>📌 ${this.paraderoMasCercanoAMi.nombre}</strong><br>
              <strong style="color:#5e72e4;">
                ⏱ ${b.eta !== null && b.eta !== undefined ? `Llega en ~${b.eta} min` : 'ETA no disponible'}
              </strong>
            </div>
          ` : ''}
        </div>
      `).join('');

      try {
        const marker = L.marker([lat, lng], { icon })
          .addTo(this.map)
          .bindPopup(`<div style="min-width:220px">${popupContent}</div>`);
        this.markers.push(marker);
      } catch {}
    });
  }

  limpiarMarkers(): void {
    if (!this.mapaInicializado || !this.map) return;
    this.markers.forEach(m => m?.remove());
    this.markers = [];
  }

  private obtenerCiudadanoId(): number | null {
    const session = this.securityService.activeUserSession;
    if (session && session.id) return Number(session.id);

    const sessionRaw = localStorage.getItem('session');
    if (sessionRaw) {
      try {
        const parsed = JSON.parse(sessionRaw);
        if (parsed.id) return Number(parsed.id);
      } catch {}
    }
    return null;
  }
}
