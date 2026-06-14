import {
  Component,
  OnDestroy,
  OnInit,
  AfterViewInit,
} from '@angular/core';

import {
  ActivatedRoute,
  Router,
} from '@angular/router';

import {
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';

import Swal from 'sweetalert2';
import * as L from 'leaflet';
import { Subscription } from 'rxjs';

import { Gps } from 'src/app/models/Gps/gps.model';
import { Bus } from 'src/app/models/Buses/bus.model';

import { GpsService } from 'src/app/services/Gps/gps.service';
import { BusService } from 'src/app/services/Bus/bus.service';
import { MonitoreoSocketService, UbicacionBusActiva } from 'src/app/services/Monitoreo/monitoreo-socket.service';

const iconDefault = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-manage-gps',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss']
})
export class ManageComponent implements OnInit, AfterViewInit, OnDestroy {

  theFormGroup!: FormGroup;

  busId!: number;
  gps?: Gps;
  gpsId?: number;

  buses: Bus[] = [];

  simulando = false;
  intervaloSimulacion: any;

  private map!: L.Map;
  private marcadorBus?: L.Marker;
  private monitoreoSub?: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private gpsService: GpsService,
    private busService: BusService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private monitoreoSocket: MonitoreoSocketService,
  ) {
    this.configFormGroup();
  }

  ngOnInit(): void {
    this.busId = Number(this.activatedRoute.snapshot.params['busId']);

    if (!this.busId || isNaN(this.busId)) {
      Swal.fire(
        'Error',
        'No se pudo obtener el bus.',
        'error'
      );

      this.back();
      return;
    }

    this.cargarBuses();
    this.cargarGpsPorBus(this.busId);
    this.suscribirseAMonitoreo();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.inicializarMapa();
    }, 300);
  }

  ngOnDestroy(): void {
    this.detenerSimulacion();
    this.monitoreoSub?.unsubscribe();

    if (this.map) {
      this.map.remove();
    }
  }

  configFormGroup(): void {
    this.theFormGroup = this.formBuilder.group({
      id: [0],
      codigo: ['', [Validators.required]],
      busId: ['', [Validators.required]],
      latitud: [null, [
        Validators.min(-90),
        Validators.max(90)
      ]],
      longitud: [null, [
        Validators.min(-180),
        Validators.max(180)
      ]],
      velocidad: [null],
      rumbo: [null],
      activo: [true]
    });
  }

  cargarBuses(): void {
    this.busService.list().subscribe({
      next: (data) => {
        this.buses = data;
      },
      error: (error) => {
        console.error('Error cargando buses:', error);
      }
    });
  }

  cargarGpsPorBus(busId: number): void {
    this.gpsService.findByBus(busId).subscribe({
      next: (gps) => {
        this.gps = gps;
        this.gpsId = gps.id;

        this.theFormGroup.patchValue({
          id: gps.id,
          codigo: gps.codigo,
          busId: gps.busId || gps.bus?.id || busId,
          latitud: gps.latitud,
          longitud: gps.longitud,
          velocidad: gps.velocidad,
          rumbo: gps.rumbo,
          activo: gps.activo
        });

        this.pintarGpsEnMapa();
      },
      error: () => {
        this.gps = undefined;
        this.gpsId = undefined;

        this.theFormGroup.patchValue({
          busId,
          codigo: `GPS-BUS${busId}`,
          activo: true
        });

        Swal.fire(
          'GPS no asignado',
          'Este bus todavía no tiene GPS. Puedes registrarlo ahora.',
          'info'
        );
      }
    });
  }

  private suscribirseAMonitoreo(): void {
    this.monitoreoSub = this.monitoreoSocket.onUbicaciones().subscribe((ubicaciones: UbicacionBusActiva[]) => {
      const actual = ubicaciones.find(u => u.busId === this.busId);

      if (!actual || actual.latitud === null || actual.longitud === null) {
        return;
      }

      this.theFormGroup.patchValue({
        latitud: actual.latitud,
        longitud: actual.longitud,
        velocidad: actual.velocidad,
        rumbo: actual.rumbo,
      }, { emitEvent: false });

      if (this.gps) {
        this.gps.latitud = actual.latitud;
        this.gps.longitud = actual.longitud;
        this.gps.velocidad = actual.velocidad ?? this.gps.velocidad;
        this.gps.rumbo = actual.rumbo ?? this.gps.rumbo;
        this.gps.ultimaActualizacion = actual.ultimaActualizacion as any;
      }

      this.pintarGpsEnMapa(false);
    });
  }

  save(): void {
    if (this.theFormGroup.invalid) {
      this.theFormGroup.markAllAsTouched();

      Swal.fire(
        'Formulario inválido',
        'Por favor complete los campos requeridos.',
        'warning'
      );
      return;
    }

    if (this.gpsId) {
      this.update();
    } else {
      this.create();
    }
  }

  create(): void {
    const data = this.construirPayloadGps();

    this.gpsService.create(data).subscribe({
      next: (gps) => {
        this.gps = gps;
        this.gpsId = gps.id;

        Swal.fire(
          'Creado',
          'GPS creado correctamente.',
          'success'
        );

        this.pintarGpsEnMapa();
      },
      error: (error) => {
        console.error('Error creando GPS:', error);

        Swal.fire({
          title: 'Error',
          text: this.obtenerMensajeError(error),
          icon: 'error'
        });
      }
    });
  }

  update(): void {
    if (!this.gpsId) return;

    const data = this.construirPayloadGps();

    this.gpsService.update(this.gpsId, data).subscribe({
      next: (gps) => {
        this.gps = gps;

        this.theFormGroup.patchValue({
          id: gps.id,
          codigo: gps.codigo,
          busId: gps.busId || gps.bus?.id,
          latitud: gps.latitud,
          longitud: gps.longitud,
          velocidad: gps.velocidad,
          rumbo: gps.rumbo,
          activo: gps.activo
        });

        Swal.fire(
          'Actualizado',
          'GPS actualizado correctamente.',
          'success'
        );

        this.pintarGpsEnMapa();
      },
      error: (error) => {
        console.error('Error actualizando GPS:', error);

        Swal.fire({
          title: 'Error',
          text: this.obtenerMensajeError(error),
          icon: 'error'
        });
      }
    });
  }

  private obtenerMensajeError(error: any): string {
    const message = error?.error?.message;

    if (Array.isArray(message)) {
      return message.join('\n');
    }

    if (typeof message === 'string') {
      return message;
    }

    if (message && typeof message === 'object') {
      return JSON.stringify(message);
    }

    if (typeof error?.error === 'string') {
      return error.error;
    }

    return 'Ocurrió un error inesperado.';
  }

  private construirPayloadGps(): Gps {
    const form = this.theFormGroup.value;

    return {
      codigo: form.codigo,
      busId: Number(form.busId),

      latitud:
        form.latitud !== null &&
        form.latitud !== undefined &&
        form.latitud !== ''
          ? Number(form.latitud)
          : undefined,

      longitud:
        form.longitud !== null &&
        form.longitud !== undefined &&
        form.longitud !== ''
          ? Number(form.longitud)
          : undefined,

      velocidad:
        form.velocidad !== null &&
        form.velocidad !== undefined &&
        form.velocidad !== ''
          ? Number(form.velocidad)
          : undefined,

      rumbo:
        form.rumbo !== null &&
        form.rumbo !== undefined &&
        form.rumbo !== ''
          ? Number(form.rumbo)
          : undefined,

      activo: form.activo === true || form.activo === 'true',
    };
  }

  activarGps(): void {
    this.gpsService.activarGps(this.busId).subscribe({
      next: (gps) => {
        this.gps = gps;

        this.theFormGroup.patchValue({
          activo: gps.activo
        });

        Swal.fire(
          'GPS activado',
          'El GPS del bus fue activado.',
          'success'
        );
      },
      error: (error) => {
        console.error('Error activando GPS:', error);

        Swal.fire(
          'Error',
          error.error?.message || 'No se pudo activar el GPS.',
          'error'
        );
      }
    });
  }

  desactivarGps(): void {
    this.gpsService.desactivarGps(this.busId).subscribe({
      next: (gps) => {
        this.gps = gps;

        this.theFormGroup.patchValue({
          activo: gps.activo
        });

        this.detenerSimulacion();

        Swal.fire(
          'GPS desactivado',
          'El GPS del bus fue desactivado.',
          'success'
        );
      },
      error: (error) => {
        console.error('Error desactivando GPS:', error);

        Swal.fire(
          'Error',
          error.error?.message || 'No se pudo desactivar el GPS.',
          'error'
        );
      }
    });
  }

  simularUnaVez(): void {
    this.gpsService.simularMovimiento(this.busId).subscribe({
      next: (gps) => {
        this.gps = gps;

        this.theFormGroup.patchValue({
          latitud: gps.latitud,
          longitud: gps.longitud,
          velocidad: gps.velocidad,
          rumbo: gps.rumbo,
          activo: gps.activo
        });

        this.pintarGpsEnMapa();
      },
      error: (error) => {
        console.error('Error simulando GPS:', error);

        Swal.fire(
          'Error',
          error.error?.message || 'No se pudo simular el movimiento.',
          'error'
        );

        this.detenerSimulacion();
      }
    });
  }

  iniciarSimulacion(): void {
    if (!this.gpsId) {
      Swal.fire(
        'Atención',
        'Primero debes guardar/asignar el GPS al bus.',
        'warning'
      );
      return;
    }

    this.simulando = true;

    this.intervaloSimulacion = setInterval(() => {
      this.simularUnaVez();
    }, 3000);
  }

  detenerSimulacion(): void {
    this.simulando = false;

    if (this.intervaloSimulacion) {
      clearInterval(this.intervaloSimulacion);
      this.intervaloSimulacion = null;
    }
  }

  inicializarMapa(): void {
    const mapaDiv = document.getElementById('mapa-gps');

    if (!mapaDiv) {
      return;
    }

    this.map = L.map('mapa-gps', {
      center: [5.0569, -75.487],
      zoom: 14,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(this.map);

    setTimeout(() => {
      this.map.invalidateSize();
      this.pintarGpsEnMapa();
    }, 300);
  }

  pintarGpsEnMapa(centrar: boolean = true): void {
    if (!this.map) {
      return;
    }

    const latitud = Number(this.theFormGroup.get('latitud')?.value);
    const longitud = Number(this.theFormGroup.get('longitud')?.value);

    if (!latitud || !longitud) {
      return;
    }

    const punto = L.latLng(latitud, longitud);

    if (this.marcadorBus) {
      this.marcadorBus.setLatLng(punto);
    } else {
      const icon = L.divIcon({
        className: '',
        html: `
          <div style="
            width:42px;
            height:42px;
            background:#5e72e4;
            border:3px solid #fff;
            border-radius:50%;
            display:flex;
            align-items:center;
            justify-content:center;
            color:#fff;
            font-weight:900;
            font-size:11px;
            box-shadow:0 2px 8px rgba(0,0,0,.35);
          ">
            BUS
          </div>
        `,
        iconSize: [42, 42],
        iconAnchor: [21, 21],
      });

      this.marcadorBus = L.marker(punto, { icon }).addTo(this.map);
    }

    this.marcadorBus.bindPopup(`
      <div style="min-width:180px">
        <strong>${this.theFormGroup.get('codigo')?.value || 'GPS'}</strong><br>
        Bus: ${this.gps?.bus?.placa || this.theFormGroup.get('busId')?.value}<br>
        Velocidad: ${this.theFormGroup.get('velocidad')?.value || 0} km/h<br>
        Rumbo: ${this.theFormGroup.get('rumbo')?.value || 0}°
      </div>
    `);

    if (centrar) {
      this.map.setView(punto, 15);
    } else {
      this.map.panTo(punto);
    }
  }

  back(): void {
    this.router.navigate(['/buses/list']);
  }
}
