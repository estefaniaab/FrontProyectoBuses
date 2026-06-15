import { Component, OnInit, AfterViewInit, OnDestroy, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as L from 'leaflet';
import Swal from 'sweetalert2';
import { MonitoreoService } from 'src/app/services/monitoreo/monitoreo.service';

@Component({
  selector: 'app-alerta-bus',
  templateUrl: './alerta-bus.component.html',
  styleUrls: ['./alerta-bus.component.scss'],
})
export class AlertaBusComponent implements OnInit, AfterViewInit, OnDestroy {

  busId!: number;
  rutaId!: number;
  paraderoId!: number;
  etaMinutos: number | null = null;
  placaBus = '';
  nombreRuta = '';

  cargando = true;
  busInfo: any = null;

  private map!: L.Map;
  private markerBus?: L.Marker;
  private intervalId: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private monitoreoService: MonitoreoService,
    private zone: NgZone,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.busId      = Number(params['busId']);
      this.rutaId     = Number(params['rutaId']);
      this.paraderoId = Number(params['paraderoId']);
      this.etaMinutos = params['etaMinutos'] != null ? Number(params['etaMinutos']) : null;
      this.placaBus   = params['placa']     || '';
      this.nombreRuta = params['nombreRuta'] || '';
    });
  }

  ngAfterViewInit(): void {
    this.inicializarMapa();
    this.cargarBus();
    this.intervalId = setInterval(() => this.cargarBus(), 10000);
  }

  ngOnDestroy(): void {
    if (this.map) this.map.remove();
    if (this.intervalId) clearInterval(this.intervalId);
  }

  private inicializarMapa(): void {
    setTimeout(() => {
      const mapElement = document.getElementById('mapa-alerta');
      if (!mapElement) return;

      this.map = L.map('mapa-alerta', {
        center: [5.0569, -75.4870],
        zoom: 15,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(this.map);

      setTimeout(() => this.map.invalidateSize(), 200);
    }, 100);
  }

  private cargarBus(): void {
    if (!this.rutaId) return;

    this.monitoreoService.obtenerActivosPorRuta(this.rutaId).subscribe({
      next: async (buses: any[]) => {
        const bus = buses.find(b => b.busId === this.busId);
        if (!bus) return;

        this.zone.run(async () => {
          this.busInfo = bus;

          if (this.paraderoId) {
            try {
              const eta = await this.monitoreoService
                .calcularEta(this.busId, this.paraderoId)
                .toPromise();
              this.etaMinutos = eta?.etaMinutos ?? this.etaMinutos;
            } catch { }
          }

          this.cargando = false;
          this.actualizarMarcadorBus(bus);
        });
      },
      error: () => { this.cargando = false; }
    });
  }

  private actualizarMarcadorBus(bus: any): void {
    if (!this.map) return;

    const lat = Number(bus.latitud);
    const lng = Number(bus.longitud);
    if (isNaN(lat) || isNaN(lng)) return;

    const latlng = L.latLng(lat, lng);

    const icon = L.divIcon({
      className: '',
      html: `
        <div style="display:flex; flex-direction:column; align-items:center; gap:2px;">
          <div style="
            background:white; border:2px solid #2dce89;
            border-radius:4px; padding:1px 6px;
            font-size:10px; font-weight:bold; color:#2dce89;
            white-space:nowrap; box-shadow:0 1px 4px rgba(0,0,0,.2);">
            ${bus.placa || this.placaBus}
          </div>
          <div style="
            width:40px; height:40px; background:#2dce89;
            border:3px solid white; border-radius:50%;
            display:flex; align-items:center; justify-content:center;
            font-size:20px; box-shadow:0 2px 8px rgba(0,0,0,.3);">🚌</div>
        </div>`,
      iconSize: [70, 56],
      iconAnchor: [35, 52],
    });

    if (this.markerBus) {
      this.markerBus.setLatLng(latlng);
      this.map.setView(latlng, this.map.getZoom());
    } else {
      this.markerBus = L.marker(latlng, { icon }).addTo(this.map);
      this.map.setView(latlng, 15);
    }
  }

  // 🔥 CORREGIDO: Navegar a monitoreo con la ruta seleccionada
  irAMapa(): void {
    this.router.navigate(['/monitoreo/seguimiento'], {
      queryParams: { rutaId: this.rutaId }
    });
  }

  irAbordar(): void {
    if (this.etaMinutos !== null && this.etaMinutos <= 2) {
      Swal.fire({
        title: '⚠️ El bus llega muy pronto',
        text: `Solo quedan ~${this.etaMinutos} min. ¿Deseas continuar con el abordaje?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, abordar',
        cancelButtonText: 'Cancelar',
      }).then(result => {
        if (result.isConfirmed) this.navegarAbordar();
      });
      return;
    }
    this.navegarAbordar();
  }

  private navegarAbordar(): void {
    this.router.navigate(['/boletos/abordar'], {
      queryParams: { rutaId: this.rutaId, paraderoId: this.paraderoId }
    });
  }

  get etaTexto(): string {
    if (this.etaMinutos === null) return 'Calculando...';
    if (this.etaMinutos === 0)    return '¡Llegando ahora!';
    return `~${this.etaMinutos} min`;
  }

  get etaColor(): string {
    if (this.etaMinutos === null) return '#6c757d';
    if (this.etaMinutos <= 2)     return '#f5365c';
    if (this.etaMinutos <= 5)     return '#fb6340';
    return '#2dce89';
  }
}
