// dashboard-buses.component.ts
import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import Swal from 'sweetalert2';
import { DashboardBusesService } from 'src/app/services/Dashboard-buses/dashboard-buses.service';

// Configurar ícono de Leaflet
const iconDefault = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-dashboard-buses',
  templateUrl: './dashboard-buses.component.html',
  styleUrls: ['./dashboard-buses.component.scss']
})
export class DashboardBusesComponent implements OnInit, AfterViewInit, OnDestroy {

  // Datos del dashboard
  dashboardData: any = null;
  ubicaciones: any[] = [];
  incidentesActivos: any[] = [];
  busesOcupacionMaxima: any[] = [];
  totalPasajerosEnTransito: number = 0;
  totalBusesActivos: number = 0;
  ultimaActualizacion: Date = new Date();

  // Mapa
  private map!: L.Map;
  private markers: L.Marker[] = [];
  private refreshInterval: any;

  // Estados
  cargando: boolean = true;
  actualizando: boolean = false;

  constructor(
    private dashboardService: DashboardBusesService
  ) {}

  ngOnInit(): void {
    this.cargarDashboard();
    this.iniciarActualizacionAutomatica();
  }

  ngAfterViewInit(): void {
    this.inicializarMapa();
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    if (this.map) {
      this.map.remove();
    }
  }

  private iniciarActualizacionAutomatica(): void {
    this.refreshInterval = setInterval(() => {
      this.cargarDashboard(true);
    }, 30000);
  }

  async cargarDashboard(silencioso: boolean = false): Promise<void> {
    try {
      if (!silencioso) {
        this.cargando = true;
      } else {
        this.actualizando = true;
      }

      this.dashboardData = await this.dashboardService.getDashboardData().toPromise();

      // Normalizar datos: convertir latitud y longitud a números
      this.ubicaciones = (this.dashboardData?.ubicaciones || []).map((bus: any) => ({
        ...bus,
        latitud: Number(bus.latitud),
        longitud: Number(bus.longitud),
        velocidad: Number(bus.velocidad) || 0,
      }));

      this.incidentesActivos = this.dashboardData?.incidentesActivos || [];
      this.busesOcupacionMaxima = this.dashboardData?.busesOcupacionMaxima || [];
      this.totalPasajerosEnTransito = this.dashboardData?.totalPasajerosEnTransito || 0;
      this.totalBusesActivos = this.dashboardData?.totalBusesActivos || 0;
      this.ultimaActualizacion = this.dashboardData?.ultimaActualizacion ? new Date(this.dashboardData.ultimaActualizacion) : new Date();

      this.actualizarMapa();

    } catch (error) {
      console.error('Error cargando dashboard:', error);
      if (!silencioso) {
        Swal.fire('Error', 'No se pudieron cargar los datos del dashboard', 'error');
      }
    } finally {
      this.cargando = false;
      this.actualizando = false;
    }
  }

  private inicializarMapa(): void {
    this.map = L.map('mapa-dashboard', {
      center: [5.0569, -75.4870],
      zoom: 12,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(this.map);
  }

  private actualizarMapa(): void {
    if (!this.map) return;

    this.markers.forEach(marker => marker.remove());
    this.markers = [];

    // Filtrar buses con coordenadas válidas
    const busesConUbicacion = this.ubicaciones.filter(bus => {
      const lat = Number(bus.latitud);
      const lng = Number(bus.longitud);
      return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
    });

    if (busesConUbicacion.length === 0) return;

    // Agrupar por ubicación
    const grupos = new Map<string, any[]>();

    busesConUbicacion.forEach(bus => {
      const lat = Number(bus.latitud);
      const lng = Number(bus.longitud);
      const key = `${lat.toFixed(6)},${lng.toFixed(6)}`;
      if (!grupos.has(key)) grupos.set(key, []);
      grupos.get(key)!.push(bus);
    });

    grupos.forEach((buses) => {
      const lat = Number(buses[0].latitud);
      const lng = Number(buses[0].longitud);
      if (isNaN(lat) || isNaN(lng)) return;

      // Determinar color del ícono (rojo si algún bus tiene incidente)
      const tieneIncidente = buses.some(b => b.enIncidente === true);
      const colorIcono = tieneIncidente ? '#f5365c' : '#2dce89';

      // Crear etiquetas con la placa (como en el monitoreo)
      const etiquetas = buses.map(bus => `
        <div style="
          background: white;
          border: 2px solid ${bus.enIncidente ? '#f5365c' : '#2dce89'};
          border-radius: 4px;
          padding: 2px 8px;
          font-size: 11px;
          font-weight: bold;
          color: ${bus.enIncidente ? '#f5365c' : '#2dce89'};
          white-space: nowrap;
          margin: 2px 0;
          text-align: center;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        ">${bus.placa || 'N/A'}</div>
      `).join('');

      // Ícono con la placa arriba (igual que en monitoreo)
      const icon = L.divIcon({
        className: '',
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
            ${etiquetas}
            <div style="
              width: 36px;
              height: 36px;
              background: ${colorIcono};
              border: 3px solid white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 16px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            ">🚌</div>
          </div>`,
        iconSize: [80, 40 + buses.length * 20],
        iconAnchor: [40, 40 + buses.length * 20],
      });

      // Popup con información del bus
      const popupContent = buses.map(bus => `
        <div style="border-bottom: 1px solid #eee; padding: 8px 0;">
          <strong style="font-size: 14px;">🚌 ${bus.placa}</strong><br>
          <span style="font-size: 12px;">⚡ Velocidad: ${bus.velocidad || 0} km/h</span><br>
          <span style="font-size: 12px;">📍 Ruta: ${bus.ruta?.nombre || 'Sin ruta'}</span><br>
          <span style="font-size: 12px;">👥 Pasajeros: ${bus.ocupacion?.actual || 0}/${bus.ocupacion?.capacidad || 60}</span><br>
          <span style="font-size: 12px;">📊 Ocupación: ${bus.ocupacion?.porcentaje || 0}%</span><br>
          <span style="font-size: 12px;">⚠️ Estado: ${bus.enIncidente ? '🔴 INCIDENTE' : '🟢 Normal'}</span>
        </div>
      `).join('');

      const marker = L.marker([lat, lng], { icon })
        .addTo(this.map)
        .bindPopup(`<div style="min-width: 220px; max-height: 300px; overflow-y: auto;">${popupContent}</div>`);

      this.markers.push(marker);
    });

    // Ajustar vista si hay marcadores
    if (this.markers.length > 0) {
      const group = L.featureGroup(this.markers);
      this.map.fitBounds(group.getBounds().pad(0.1));
    }
  }

  verDetalleBus(busId: number): void {
    this.dashboardService.getDetalleBus(busId).subscribe({
      next: (detalle) => {
        Swal.fire({
          title: `🚌 Detalle del Bus ${detalle.placa}`,
          html: `
            <div style="text-align: left;">
              <p><strong>📋 Placa:</strong> ${detalle.placa}</p>
              <p><strong>🛣️ Ruta:</strong> ${detalle.ruta?.nombre || 'N/A'}</p>
              <p><strong>⚡ Velocidad:</strong> ${detalle.velocidad || 0} km/h</p>
              <p><strong>👥 Pasajeros:</strong> ${detalle.ocupacion?.actual || 0} / ${detalle.ocupacion?.capacidad || 60}</p>
              <p><strong>📊 Ocupación:</strong> ${detalle.ocupacion?.porcentaje || 0}%</p>
              ${detalle.enIncidente ? '<p style="color: #f5365c;"><strong>⚠️ INCIDENTE ACTIVO</strong></p>' : ''}
            </div>
          `,
          confirmButtonText: 'Cerrar',
          confirmButtonColor: '#5e72e4',
        });
      },
      error: () => Swal.fire('Error', 'No se pudo obtener el detalle del bus', 'error')
    });
  }

  verTodosIncidentes(): void {
    if (this.incidentesActivos.length === 0) {
      Swal.fire('Sin incidentes', 'No hay incidentes activos en este momento', 'info');
      return;
    }

    let html = '<div style="max-height: 500px; overflow-y: auto; text-align: left;">';
    this.incidentesActivos.forEach(inc => {
      html += `
        <div style="border-bottom: 1px solid #eee; padding: 12px; margin-bottom: 8px;">
          <strong>🚌 Bus ${inc.placa}</strong>
          <div><strong>Tipo:</strong> ${inc.tipoIncidente}</div>
          <div><strong>Descripción:</strong> ${inc.descripcion.substring(0, 100)}${inc.descripcion.length > 100 ? '...' : ''}</div>
          <div><strong>Gravedad:</strong> ${inc.gravedad}</div>
          <div><strong>Reportado:</strong> ${new Date(inc.reportadoEn).toLocaleString()}</div>
        </div>
      `;
    });
    html += '</div>';

    Swal.fire({
      title: '📋 Incidentes Activos',
      html,
      width: '600px',
      showConfirmButton: true,
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#5e72e4',
      showCloseButton: true,
    });
  }

  actualizarDatos(): void {
    this.cargarDashboard();
  }
}
