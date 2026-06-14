import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  NgZone,
} from '@angular/core';

import * as L from 'leaflet';
import Swal from 'sweetalert2';

import { MonitoreoService } from 'src/app/services/monitoreo/monitoreo.service';
import { RutaService } from 'src/app/services/ruta/ruta.service';
import { NodoService } from 'src/app/services/Nodo/nodo.service';

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

  private map!: L.Map;
  private markers: L.Marker[] = [];
  private marcadoresParaderos: L.Marker[] = [];
  private lineaRuta?: L.Polyline;
  private markerUsuario?: L.Marker;
  private nodosRutaActual: any[] = [];
  private intervalId: any;
  private watchId: number | null = null;

  constructor(
    private monitoreoService: MonitoreoService,
    private rutaService: RutaService,
    private nodoService: NodoService,
    private zone: NgZone,
  ) {}

  ngOnInit(): void {
    this.cargarRutas();
  }

  ngAfterViewInit(): void {
    this.inicializarMapa();
    this.iniciarGeolocalizacion();

    this.intervalId = setInterval(() => {
      if (this.rutaSeleccionada) {
        this.cargarUbicacionesPorRuta();
      }
    }, 10000);
  }

  ngOnDestroy(): void {
    if (this.map) this.map.remove();
    if (this.intervalId) clearInterval(this.intervalId);
    if (this.watchId !== null) navigator.geolocation.clearWatch(this.watchId);
  }

  // ── Geolocalización ───────────────────────────────────────────────────────

  iniciarGeolocalizacion(): void {
    if (!navigator.geolocation) return;

    this.watchId = navigator.geolocation.watchPosition(
      (pos) => {
        this.zone.run(() => {
          this.miLatitud = pos.coords.latitude;
          this.miLongitud = pos.coords.longitude;
          this.actualizarMarcadorUsuario();

          if (this.rutaSeleccionada && this.nodosRutaActual.length > 0) {
            const anteriorId = this.paraderoMasCercanoAMi?.id;
            this.recalcularParaderoCercano();

            // Si cambió el paradero más cercano, recargar ETA
            if (this.paraderoMasCercanoAMi?.id !== anteriorId) {
              this.cargarUbicacionesPorRuta();
            }
          }
        });
      },
      (err) => console.warn('Geolocalización no disponible', err),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 }
    );
  }

  private actualizarMarcadorUsuario(): void {
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
        this.miLatitud!,
        this.miLongitud!,
        Number(n.paradero.latitud),
        Number(n.paradero.longitud)
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

  // ── Rutas ─────────────────────────────────────────────────────────────────

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

    if (!this.rutaSeleccionada) return;

    this.cargarParaderosRuta(this.rutaSeleccionada);
  }

  inicializarMapa(): void {
    this.map = L.map('mapa-buses', {
      center: [5.0569, -75.4870],
      zoom: 13,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(this.map);

    setTimeout(() => this.map.invalidateSize(), 200);
  }

  // ── Paraderos ─────────────────────────────────────────────────────────────

  cargarParaderosRuta(rutaId: number): void {
    this.nodoService.getByRuta(rutaId).subscribe({
      next: (nodos) => {
        this.nodosRutaActual = nodos
          .filter((n: any) => n.paradero?.latitud != null)
          .sort((a: any, b: any) => (a.orden ?? 0) - (b.orden ?? 0));

        this.pintarParaderos(this.nodosRutaActual);

        // Primero calcular paradero cercano, luego cargar buses con ETA correcto
        this.recalcularParaderoCercano();
        this.cargarUbicacionesPorRuta();
      },
      error: () => console.error('No se pudieron cargar los paraderos')
    });
  }

  pintarParaderos(nodos: any[]): void {
    this.limpiarParaderos();
    if (nodos.length === 0) return;

    const posiciones: L.LatLngExpression[] = nodos.map((n: any) => [
      Number(n.paradero.latitud),
      Number(n.paradero.longitud),
    ]);

    this.lineaRuta = L.polyline(posiciones, {
      color: '#5e72e4',
      weight: 4,
      opacity: 0.7,
      dashArray: '8, 6',
    }).addTo(this.map);

    nodos.forEach((nodo: any, idx: number) => {
      const paradero = nodo.paradero;
      const esInicio = idx === 0;
      const esFin = idx === nodos.length - 1;
      const bgColor = esInicio ? '#2dce89' : esFin ? '#f5365c' : '#5e72e4';

      const icon = L.divIcon({
        className: '',
        html: `<div style="
          width:28px; height:28px;
          background:${bgColor};
          border:2px solid white;
          border-radius:50%;
          display:flex; align-items:center; justify-content:center;
          font-weight:800; font-size:11px; color:white;
          box-shadow:0 2px 6px rgba(0,0,0,0.3);">
          ${nodo.orden}
        </div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker(
        [Number(paradero.latitud), Number(paradero.longitud)],
        { icon }
      )
        .addTo(this.map)
        .bindPopup(`<strong>${nodo.orden}. ${paradero.nombre}</strong>`);

      this.marcadoresParaderos.push(marker);
    });

    this.map.fitBounds(this.lineaRuta.getBounds(), { padding: [40, 40] });
  }

  limpiarParaderos(): void {
    if (this.lineaRuta) {
      this.map.removeLayer(this.lineaRuta);
      this.lineaRuta = undefined;
    }
    this.marcadoresParaderos.forEach(m => m.remove());
    this.marcadoresParaderos = [];
  }

  // ── Buses ─────────────────────────────────────────────────────────────────

  cargarUbicacionesPorRuta(): void {
    if (!this.rutaSeleccionada) return;
    this.cargando = true;

    this.monitoreoService.obtenerActivosPorRuta(this.rutaSeleccionada).subscribe({
      next: async (data) => {
        const busesConEta = await Promise.all(
          (data || []).map(async (bus: any) => {
            if (!this.paraderoMasCercanoAMi?.id) {
              return { ...bus, eta: null };
            }
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
        Swal.fire(
          'Error',
          error.error?.message || 'No se pudieron cargar los buses.',
          'error'
        );
      }
    });
  }

  pintarBuses(): void {
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
          white-space:nowrap;
          box-shadow:0 1px 4px rgba(0,0,0,.2);
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
              width:36px; height:36px;
              background:${colorIcono};
              border:3px solid white;
              border-radius:50%;
              display:flex; align-items:center; justify-content:center;
              color:white; font-size:16px;
              box-shadow:0 2px 8px rgba(0,0,0,.3);">🚌</div>
          </div>`,
        iconSize: [70, 20 * busesCercanos.length + 40],
        iconAnchor: [35, 20 * busesCercanos.length + 36],
      });

      const popupContent = busesCercanos.map(b => `
        <div style="border-bottom:1px solid #eee; padding:8px 0;">
          <strong style="font-size:14px;">🚌 ${b.placa}</strong><br>
          <span style="font-size:12px;">Velocidad: ${b.velocidad || 0} km/h</span><br>
          <span style="font-size:12px;">📍 Cerca de: ${b.paraderoMasCercano?.nombre || 'N/D'}</span><br>
          <span style="font-size:12px;">Estado: ${b.retrasado ? '🔴 Detenido' : '🟢 En movimiento'}</span>
          ${this.paraderoMasCercanoAMi ? `
            <div style="
              margin-top:6px; padding:6px 8px;
              background:#f0f4ff; border-radius:6px;
              border-left:3px solid #5e72e4;">
              <span style="font-size:11px; color:#6c757d;">Tu paradero más cercano:</span><br>
              <strong style="font-size:12px;">📌 ${this.paraderoMasCercanoAMi.nombre}</strong><br>
              <strong style="font-size:14px; color:#5e72e4;">
                ⏱ ${b.eta !== null && b.eta !== undefined
                  ? `Llega en ~${b.eta} min`
                  : 'ETA no disponible'}
              </strong>
            </div>
          ` : ''}
        </div>
      `).join('');

      const marker = L.marker([lat, lng], { icon })
        .addTo(this.map)
        .bindPopup(`<div style="min-width:220px">${popupContent}</div>`);

      this.markers.push(marker);
    });
  }

  limpiarMarkers(): void {
    this.markers.forEach(m => m.remove());
    this.markers = [];
  }
}
