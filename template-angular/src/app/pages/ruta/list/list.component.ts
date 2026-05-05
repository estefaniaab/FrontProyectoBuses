// ─────────────────────────────────────────────────────────────────────────────
// src/app/pages/rutas/list/list.component.ts
// ─────────────────────────────────────────────────────────────────────────────

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Ruta } from 'src/app/models/Rutas/ruta.model';
import { RutaService } from 'src/app/services/Ruta/ruta.service';
import { Nodo } from 'src/app/models/Nodos/nodo.model';
import { NodoService } from 'src/app/services/Nodo/nodo.service';
import Swal from 'sweetalert2';
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
  selector: 'app-list-rutas',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit {
  rutas: Ruta[] = [];
  rutasFiltradas: Ruta[] = [];
  filtroNombre = '';
  focus = false;

  // ── Modal mapa ────────────────────────────────────────────────────────────
  rutaSeleccionada: Ruta | null = null;
  nodosRuta: Nodo[] = [];
  showParaderosRutaModal = false;
  loadingParaderosRuta = false;
  errorParaderosRuta = '';

  private mapaParaderosRuta?: L.Map;
  private lineaRuta?: L.Polyline;
  private marcadoresParaderosRuta: L.Marker[] = [];

  // ── Modal gestionar paraderos ─────────────────────────────────────────────
  showGestionarModal = false;
  rutaGestionId: number | null = null;
  rutaGestionNombre = '';

  constructor(
    private rutasService: RutaService,
    private nodoService: NodoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.list();
  }

  list(): void {
    this.rutasService.list(this.filtroNombre).subscribe({
      next: (rutas) => (this.rutas = rutas),
    });
  }

  filtrarRutas(): void {
    this.list();
  }

  create(): void {
    this.router.navigate(['/rutas/create']);
  }

  view(id: string): void {
    this.router.navigate(['/rutas/view/' + id]);
  }

  edit(id: string): void {
    this.router.navigate(['/rutas/update/' + id]);
  }

  delete(id: string): void {
    Swal.fire({
      title: 'Eliminar',
      text: '¿Está seguro que quiere eliminar el registro?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.rutasService.delete(id).subscribe(() => {
          Swal.fire('Eliminado!', 'Registro eliminado correctamente.', 'success');
          this.list();
        });
      }
    });
  }

  // ── Abrir modal "Gestionar Paraderos" ─────────────────────────────────────

  openGestionarParaderos(ruta: Ruta): void {
    if (!ruta.id) return;
    this.rutaGestionId = ruta.id;
    this.rutaGestionNombre = ruta.nombre ?? '';
    this.showGestionarModal = true;
  }

  onGestionarClosed(huboGuardado: boolean): void {
    this.showGestionarModal = false;
    this.rutaGestionId = null;
    this.rutaGestionNombre = '';
    if (huboGuardado) {
      this.list(); // refresca tabla si se guardaron cambios
    }
  }

  // ── Modal mapa de paraderos ───────────────────────────────────────────────

  // En openParaderosRutaModal, actualiza el método para llamar a los cálculos
  openParaderosRutaModal(ruta: Ruta): void {
    if (!ruta.id) return;

    this.rutaSeleccionada = ruta;
    this.nodosRuta = [];
    this.errorParaderosRuta = '';
    this.loadingParaderosRuta = true;
    this.showParaderosRutaModal = true;

    this.nodoService.getByRuta(ruta.id).subscribe({
      next: (data) => {
        this.nodosRuta = data.sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
        this.calcularDistanciasYTiempos(); // ▶ Cálculo añadido aquí
        this.loadingParaderosRuta = false;
        setTimeout(() => {
          this.inicializarMapaParaderosRuta();
          this.pintarParaderosRutaEnMapa();
        }, 100);
      },
      error: () => {
        this.errorParaderosRuta = 'No se pudieron cargar los paraderos de esta ruta.';
        this.loadingParaderosRuta = false;
      },
    });
  }

  // ▶ Añade estos métodos auxiliares y de cálculo en la clase ListComponent:

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private calcularDistanciasYTiempos(): void {
    const VELOCIDAD_BUS_KMH = 25;
    const RADIO_TIERRA_KM = 6371;

    this.nodosRuta.forEach((nodo, index) => {
      const nodoAny = nodo as any;

      if (index === 0) {
        nodoAny.distanciaDesdeAnterior = 0;
        nodoAny.tiempoEstimado = 0;
      } else {
        const nodoAnterior = this.nodosRuta[index - 1];
        const p1 = nodoAnterior.paradero;
        const p2 = nodo.paradero;

        if (p1 && p2) {
          const dLat = this.deg2rad(Number(p2.latitud) - Number(p1.latitud));
          const dLon = this.deg2rad(Number(p2.longitud) - Number(p1.longitud));
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(Number(p1.latitud))) *
            Math.cos(this.deg2rad(Number(p2.latitud))) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const dist = RADIO_TIERRA_KM * c;

          nodoAny.distanciaDesdeAnterior = parseFloat(dist.toFixed(3));
          nodoAny.tiempoEstimado = Math.round((dist / VELOCIDAD_BUS_KMH) * 60);
        } else {
          nodoAny.distanciaDesdeAnterior = 0;
          nodoAny.tiempoEstimado = 0;
        }
      }
    });
  }

  closeParaderosRutaModal(): void {
    this.showParaderosRutaModal = false;
    this.rutaSeleccionada = null;
    this.nodosRuta = [];
    this.errorParaderosRuta = '';
    this.loadingParaderosRuta = false;
    this.limpiarMapaParaderosRuta();
  }

  private inicializarMapaParaderosRuta(): void {
    if (this.mapaParaderosRuta) {
      this.mapaParaderosRuta.remove();
    }

    this.mapaParaderosRuta = L.map('mapa-paraderos-ruta', {
      center: [5.0569, -75.487],
      zoom: 13,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(this.mapaParaderosRuta);

    setTimeout(() => this.mapaParaderosRuta?.invalidateSize(), 200);
  }

  private pintarParaderosRutaEnMapa(): void {
    if (!this.mapaParaderosRuta) return;

    this.limpiarCapasParaderosRuta();

    const nodosValidos = this.nodosRuta
      .filter(
        (nodo) =>
          nodo.paradero &&
          nodo.paradero.latitud !== undefined &&
          nodo.paradero.longitud !== undefined
      )
      .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));

    const posiciones: L.LatLngExpression[] = nodosValidos.map((nodo) => [
      Number(nodo.paradero!.latitud),
      Number(nodo.paradero!.longitud),
    ]);

    if (posiciones.length === 0) return;

    this.lineaRuta = L.polyline(posiciones, { weight: 5, opacity: 0.8 }).addTo(
      this.mapaParaderosRuta
    );

    nodosValidos.forEach((nodo) => {
      const paradero = nodo.paradero!;

      const icon = L.divIcon({
        className: '',
        html: `
          <div style="
            width:30px;height:30px;background:#2563eb;border:2px solid #fff;
            border-radius:50%;display:flex;align-items:center;justify-content:center;
            font-weight:800;font-size:13px;color:#fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);">
            ${nodo.orden ?? ''}
          </div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      const marker = L.marker([Number(paradero.latitud), Number(paradero.longitud)], { icon })
        .addTo(this.mapaParaderosRuta!)
        .bindPopup(`<strong>${nodo.orden}. ${paradero.nombre}</strong><br><span>${paradero.clasificacion ?? ''}</span>`);

      this.marcadoresParaderosRuta.push(marker);
    });

    this.mapaParaderosRuta.fitBounds(this.lineaRuta.getBounds(), { padding: [40, 40] });
  }

  private limpiarCapasParaderosRuta(): void {
    if (!this.mapaParaderosRuta) return;

    if (this.lineaRuta) {
      this.mapaParaderosRuta.removeLayer(this.lineaRuta);
      this.lineaRuta = undefined;
    }

    this.marcadoresParaderosRuta.forEach((m) => this.mapaParaderosRuta?.removeLayer(m));
    this.marcadoresParaderosRuta = [];
  }

  private limpiarMapaParaderosRuta(): void {
    this.limpiarCapasParaderosRuta();

    if (this.mapaParaderosRuta) {
      this.mapaParaderosRuta.remove();
      this.mapaParaderosRuta = undefined;
    }
  }
}
