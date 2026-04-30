import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  NgZone,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ParaderoService } from '../../services/Paradero/paradero.service';
import { ParaderoCercano } from 'src/app/models/Paradero/paradero.model'; // ← CAMBIO 1
import * as L from 'leaflet';

const iconDefault = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-paradero-cercano',
  standalone: true,
  imports: [CommonModule, HttpClientModule, DecimalPipe],
  templateUrl: './paradero-cercano.component.html',
  styleUrls: ['./paradero-cercano.component.scss'],
})
export class ParaderoCercanoComponent implements OnInit, AfterViewInit, OnDestroy {

  paraderos: ParaderoCercano[] = [];              // ← CAMBIO 2
  estado: 'idle' | 'cargando' | 'ok' | 'error' = 'idle';
  errorMsg = '';
  paraderoSeleccionado: ParaderoCercano | null = null; // ← CAMBIO 3

  private map!: L.Map;
  private marcadores: L.Marker[] = [];
  private userMarker: L.Marker | null = null;
  private userCircle: L.Circle | null = null;
  private watchId: number | null = null;
  private primeraVez = true;
  private lastLat: number | null = null;
  private lastLng: number | null = null;
  private readonly UMBRAL_METROS = 50;

  readonly CLASIFICACION_LABEL: Record<string, string> = {
    principal: 'Principal',
    secundario: 'Secundario',
    terminal: 'Terminal',
  };

  constructor(
    private paraderoService: ParaderoService,
    private zone: NgZone,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.inicializarMapa();
    this.solicitarUbicacion();
  }

  ngOnDestroy(): void {
    if (this.watchId !== null) navigator.geolocation.clearWatch(this.watchId);
    if (this.map) this.map.remove();
  }

  private inicializarMapa(): void {
    this.map = L.map('mapa-paraderos', {
      zoomControl: true,
      center: [6.2442, -75.5812],
      zoom: 13,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(this.map);
    setTimeout(() => this.map.invalidateSize(), 100);
  }

  solicitarUbicacion(): void {
    if (!navigator.geolocation) {
      this.errorMsg = 'Tu navegador no soporta geolocalización.';
      this.estado = 'error';
      this.cdr.detectChanges();
      return;
    }
    this.estado = 'cargando';
    this.cdr.detectChanges();
    this.watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng, accuracy } = pos.coords;
        this.zone.run(() => this.onPosicionActualizada(lat, lng, accuracy));
      },
      (err) => {
        this.zone.run(() => {
          this.errorMsg = err.code === 1
            ? 'Permiso de ubicación denegado. Actívalo en tu navegador y recarga la página.'
            : 'No se pudo obtener tu ubicación. Verifica tu GPS.';
          this.estado = 'error';
          this.cdr.detectChanges();
        });
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 },
    );
  }

  private onPosicionActualizada(lat: number, lng: number, accuracy: number): void {
    this.actualizarMarcadorUsuario(lat, lng, accuracy);
    const desplazamiento = this.lastLat === null
      ? Infinity
      : this.calcularDistancia(this.lastLat, this.lastLng!, lat, lng);
    if (desplazamiento >= this.UMBRAL_METROS) {
      this.lastLat = lat;
      this.lastLng = lng;
      this.cargarParaderos(lat, lng);
    }
  }

  private actualizarMarcadorUsuario(lat: number, lng: number, accuracy: number): void {
    const latlng = L.latLng(lat, lng);
    if (this.userMarker) {
      this.userMarker.setLatLng(latlng);
      this.userCircle?.setLatLng(latlng).setRadius(accuracy);
    } else {
      this.userCircle = L.circle(latlng, {
        radius: accuracy,
        color: '#3b82f6',
        fillColor: '#93c5fd',
        fillOpacity: 0.2,
        weight: 1,
      }).addTo(this.map);
      const userIcon = L.divIcon({
        className: '',
        html: `<div style="width:16px;height:16px;background:#3b82f6;border:3px solid #fff;border-radius:50%;box-shadow:0 0 0 3px rgba(59,130,246,0.4);"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
      this.userMarker = L.marker(latlng, { icon: userIcon, zIndexOffset: 1000 })
        .addTo(this.map)
        .bindPopup('<strong>📍 Tu ubicación</strong>');
    }
    if (this.primeraVez) {
      this.map.setView(latlng, 16);
      this.primeraVez = false;
    }
  }

  private cargarParaderos(lat: number, lng: number): void {
    this.estado = 'cargando';
    this.cdr.detectChanges();
    this.paraderoService.buscarCercanos(lat, lng).subscribe({
      next: (data) => {
        this.paraderos = data;
        this.estado = 'ok';
        this.pintarMarcadoresParaderos(data);
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMsg = 'Error al conectar con el servidor. Verifica que el backend esté corriendo.';
        this.estado = 'error';
        this.cdr.detectChanges();
      },
    });
  }

  private pintarMarcadoresParaderos(paraderos: ParaderoCercano[]): void {
    this.marcadores.forEach(m => m.remove());
    this.marcadores = [];
    const COLORES: Record<string, string> = {
      principal:  '#f59e0b',
      secundario: '#22c55e',
      terminal:   '#a855f7',
    };
    paraderos.forEach((p, i) => {
      const color = COLORES[p.clasificacion] ?? '#64748b';
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:32px;height:32px;background:${color};border:2px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;color:#fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);cursor:pointer;">${i + 1}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
      const marker = L.marker([p.latitud, p.longitud], { icon })
        .addTo(this.map)
        .bindPopup(`
          <div style="min-width:160px">
            <strong>${p.nombre}</strong><br>
            <span style="font-size:12px;color:#64748b">${this.CLASIFICACION_LABEL[p.clasificacion]}</span><br>
            <span style="font-size:13px;font-weight:600;color:#f59e0b">
              📏 ${this.formatearDistancia(p.distancia_metros)}
            </span>
          </div>
        `)
        .on('click', () => {
          this.zone.run(() => {
            this.paraderoSeleccionado = p;
            this.cdr.detectChanges();
          });
        });
      this.marcadores.push(marker);
    });
  }

  seleccionarParadero(p: ParaderoCercano): void {
    this.paraderoSeleccionado = p;
    this.map.flyTo([p.latitud, p.longitud], 17, { duration: 0.8 });
    const idx = this.paraderos.indexOf(p);
    if (idx >= 0) this.marcadores[idx]?.openPopup();
  }

  getColor(clasificacion: string): string {
    const COLORES: Record<string, string> = {
      principal:  '#f59e0b',
      secundario: '#22c55e',
      terminal:   '#a855f7',
    };
    return COLORES[clasificacion] ?? '#64748b';
  }

  cerrarDetalle(): void {
    this.paraderoSeleccionado = null;
  }

  formatearDistancia(metros: number): string {
    return metros >= 1000
      ? `${(metros / 1000).toFixed(1)} km`
      : `${Math.round(metros)} m`;
  }

  private calcularDistancia(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2
      + Math.cos(lat1 * Math.PI / 180)
      * Math.cos(lat2 * Math.PI / 180)
      * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}
