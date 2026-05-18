import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import * as L from 'leaflet';

import { Historial } from 'src/app/models/Historial/historial.model';
import { HistorialService } from 'src/app/services/Historial/historial.service';

const iconDefault = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-recorrido-historial',
  templateUrl: './recorrido.component.html',
  styleUrls: ['./recorrido.component.scss'],
})
export class RecorridoComponent implements OnInit, AfterViewInit, OnDestroy {

  boletoId!: number;

  historial: Historial[] = [];
  nodosRuta: any[] = [];

  rutaNombre = 'Sin ruta';
  busPlaca = 'No disponible';
  conductorNombre = 'No disponible';

  cargando = false;

  private map!: L.Map;
  private rutaPolyline?: L.Polyline;
  private marcadores: L.Marker[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private historialService: HistorialService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.boletoId = Number(this.activatedRoute.snapshot.params['boletoId']);
  }

  ngAfterViewInit(): void {
    this.inicializarMapa();
    this.cargarRecorrido();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private inicializarMapa(): void {
    this.map = L.map('mapa-recorrido', {
      zoomControl: true,
      center: [5.0569, -75.4870],
      zoom: 13,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(this.map);

    setTimeout(() => this.map.invalidateSize(), 200);
  }

  cargarRecorrido(): void {
    this.cargando = true;

    this.historialService.findByBoleto(this.boletoId).subscribe({
      next: (data) => {
        this.historial = data || [];

        if (this.historial.length === 0) {
          this.cargando = false;

          Swal.fire(
            'Sin historial',
            'Este boleto todavía no tiene validaciones registradas.',
            'info'
          );

          return;
        }

        this.extraerInfoGeneral();

        const rutaId = this.obtenerRutaId();

        if (!rutaId) {
          this.cargando = false;

          Swal.fire(
            'Error',
            'No se pudo obtener la ruta del boleto.',
            'error'
          );

          return;
        }

        this.cargarNodosRuta(rutaId);
      },
      error: (error) => {
        this.cargando = false;

        console.error('Error cargando recorrido:', error);

        Swal.fire(
          'Error',
          error.error?.message || 'No se pudo cargar el recorrido del boleto.',
          'error'
        );
      },
    });
  }

  cargarNodosRuta(rutaId: number): void {
    this.historialService.getNodosByRuta(rutaId).subscribe({
      next: (data) => {
        this.nodosRuta = data || [];
        this.cargando = false;

        this.pintarMapa();
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.cargando = false;

        console.error('Error cargando nodos de la ruta:', error);

        Swal.fire(
          'Error',
          error.error?.message || 'No se pudieron cargar los paraderos de la ruta.',
          'error'
        );
      },
    });
  }

  private extraerInfoGeneral(): void {
    const primero: any = this.historial[0];

    this.rutaNombre =
      this.abordaje?.nodo?.ruta?.nombre ||
      this.descenso?.nodo?.ruta?.nombre ||
      primero?.boleto?.programacionRuta?.ruta?.nombre ||
      'Sin ruta';

    const bus =
      primero?.boleto?.programacionRuta?.bus ||
      this.abordaje?.boleto?.programacionRuta?.bus ||
      this.descenso?.boleto?.programacionRuta?.bus;

    this.busPlaca = bus?.placa || 'No disponible';

    const fechaAbordaje =
      this.abordaje?.fechaValidacion ||
      primero?.fechaValidacion;

    if (bus?.id && fechaAbordaje) {
      this.cargarConductorDelAbordaje(bus.id, fechaAbordaje);
    } else {
      this.conductorNombre = 'No disponible';
    }
  }

  cargarConductorDelAbordaje(busId: number, fechaAbordaje: string): void {
    this.historialService.getTurnoByBusAndFecha(busId, fechaAbordaje).subscribe({
      next: (turno) => {
        console.log('Turno del abordaje recibido:', turno);

        if (!turno) {
          this.conductorNombre = 'No disponible';
          return;
        }

        this.conductorNombre =
          turno.conductor?.usuario?.name ||
          turno.conductor?.usuario?.nombre ||
          turno.conductor?.nombre ||
          turno.conductor?.licencia ||
          turno.conductor?.userId ||
          `Conductor #${turno.conductorId}`;
      },
      error: (err) => {
        console.error('Error obteniendo conductor del abordaje:', err);
        this.conductorNombre = 'No disponible';
      },
    });
  }


  private obtenerRutaId(): number | null {
    const itemConRuta: any = this.historial.find(
      (item: any) => item.nodo?.ruta?.id
    );

    if (itemConRuta?.nodo?.ruta?.id) {
      return Number(itemConRuta.nodo.ruta.id);
    }

    const itemConProgramacion: any = this.historial.find(
      (item: any) => item.boleto?.programacionRuta?.ruta?.id
    );

    if (itemConProgramacion?.boleto?.programacionRuta?.ruta?.id) {
      return Number(itemConProgramacion.boleto.programacionRuta.ruta.id);
    }

    return null;
  }

  private pintarMapa(): void {
    this.limpiarMapa();

    const puntosRuta = this.nodosRuta
      .filter(nodo => nodo.paradero?.latitud && nodo.paradero?.longitud)
      .map(nodo => L.latLng(
        Number(nodo.paradero.latitud),
        Number(nodo.paradero.longitud),
      ));

    if (puntosRuta.length > 0) {
      this.rutaPolyline = L.polyline(puntosRuta, {
        color: '#5e72e4',
        weight: 5,
        opacity: 0.9,
      }).addTo(this.map);

      this.map.fitBounds(this.rutaPolyline.getBounds(), {
        padding: [40, 40],
      });
    }

    this.pintarParaderosRuta();
    this.pintarMarcadorAbordaje();
    this.pintarMarcadorDescenso();

    setTimeout(() => this.map.invalidateSize(), 200);
  }

  private limpiarMapa(): void {
    this.marcadores.forEach(marker => marker.remove());
    this.marcadores = [];

    if (this.rutaPolyline) {
      this.rutaPolyline.remove();
      this.rutaPolyline = undefined;
    }
  }

  private pintarParaderosRuta(): void {
    this.nodosRuta.forEach((nodo, index) => {
      const p = nodo.paradero;

      if (!p?.latitud || !p?.longitud) return;

      const icon = L.divIcon({
        className: '',
        html: `
          <div style="
            width:30px;
            height:30px;
            background:#8898aa;
            border:2px solid #fff;
            border-radius:50%;
            display:flex;
            align-items:center;
            justify-content:center;
            font-weight:800;
            font-size:12px;
            color:#fff;
            box-shadow:0 2px 6px rgba(0,0,0,0.3);
          ">
            ${nodo.orden ?? index + 1}
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      const marker = L.marker(
        [Number(p.latitud), Number(p.longitud)],
        { icon }
      )
        .addTo(this.map)
        .bindPopup(`
          <div style="min-width:180px">
            <strong>${p.nombre}</strong><br>
            <span style="font-size:12px;color:#64748b">
              Orden ${nodo.orden}
            </span>
          </div>
        `);

      this.marcadores.push(marker);
    });
  }

  private pintarMarcadorAbordaje(): void {
    const p: any = this.abordaje?.nodo?.paradero;

    if (!p?.latitud || !p?.longitud) return;

    const icon = L.divIcon({
      className: '',
      html: `
        <div style="
          width:40px;
          height:40px;
          background:#2dce89;
          border:3px solid #fff;
          border-radius:50%;
          display:flex;
          align-items:center;
          justify-content:center;
          font-weight:900;
          font-size:16px;
          color:white;
          box-shadow:0 2px 8px rgba(0,0,0,.35);
        ">
          A
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    const marker = L.marker(
      [Number(p.latitud), Number(p.longitud)],
      { icon, zIndexOffset: 1000 }
    )
      .addTo(this.map)
      .bindPopup(`
        <div style="min-width:180px">
          <strong>Abordaje</strong><br>
          ${p.nombre}<br>
          <span style="font-size:12px;color:#64748b">
            ${this.formatearFecha(this.horaAbordaje)}
          </span>
        </div>
      `);

    this.marcadores.push(marker);
  }

  private pintarMarcadorDescenso(): void {
    const p: any = this.descenso?.nodo?.paradero;

    if (!p?.latitud || !p?.longitud) return;

    const icon = L.divIcon({
      className: '',
      html: `
        <div style="
          width:40px;
          height:40px;
          background:#11cdef;
          border:3px solid #fff;
          border-radius:50%;
          display:flex;
          align-items:center;
          justify-content:center;
          font-weight:900;
          font-size:16px;
          color:white;
          box-shadow:0 2px 8px rgba(0,0,0,.35);
        ">
          D
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    const marker = L.marker(
      [Number(p.latitud), Number(p.longitud)],
      { icon, zIndexOffset: 1000 }
    )
      .addTo(this.map)
      .bindPopup(`
        <div style="min-width:180px">
          <strong>Descenso</strong><br>
          ${p.nombre}<br>
          <span style="font-size:12px;color:#64748b">
            ${this.formatearFecha(this.horaDescenso)}
          </span>
        </div>
      `);

    this.marcadores.push(marker);
  }

  get abordaje(): any {
    return this.historial.find((item: any) => item.tipo === 'abordaje');
  }

  get descenso(): any {
    return this.historial.find((item: any) => item.tipo === 'descenso');
  }

  get paraderoAbordaje(): string {
    return this.abordaje?.nodo?.paradero?.nombre || 'No registrado';
  }

  get paraderoDescenso(): string {
    return this.descenso?.nodo?.paradero?.nombre || 'No registrado';
  }

  get horaAbordaje(): Date | null {
    return this.abordaje?.fechaValidacion || null;
  }

  get horaDescenso(): Date | null {
    return this.descenso?.fechaValidacion || null;
  }

  get tiempoTotal(): string {
    if (!this.horaAbordaje || !this.horaDescenso) {
      return 'No disponible';
    }

    const inicio = new Date(this.horaAbordaje).getTime();
    const fin = new Date(this.horaDescenso).getTime();

    const diferenciaMs = fin - inicio;

    if (diferenciaMs <= 0) {
      return 'No disponible';
    }

    const minutos = Math.floor(diferenciaMs / 60000);
    const horas = Math.floor(minutos / 60);
    const minutosRestantes = minutos % 60;

    if (horas > 0) {
      return `${horas} h ${minutosRestantes} min`;
    }

    return `${minutos} min`;
  }

  formatearFecha(fecha: Date | null): string {
    if (!fecha) return 'No disponible';

    return new Date(fecha).toLocaleString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  back(): void {
    this.router.navigate(['/historial/list']);
  }


}
