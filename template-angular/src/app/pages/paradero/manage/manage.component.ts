import { Component, OnInit, OnDestroy, AfterViewInit, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Paradero } from 'src/app/models/Paradero/paradero.model';
import { ParaderoService } from 'src/app/services/Paradero/paradero.service';
import { ClasificacionParadero } from 'src/app/models/Paradero/clasificacion-paradero.enum';
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
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss']
})
export class ManageComponent implements OnInit, AfterViewInit, OnDestroy {

  mode: number = 1; // 1: view, 2: create, 3: update
  paradero: Paradero = new Paradero();
  theFormGroup!: FormGroup;
  trySend = false;

  private map!: L.Map;
  private marcador: L.Marker | null = null;

  modoMapa = false;

  readonly CLASIFICACIONES = Object.values(ClasificacionParadero);

  readonly CLASIFICACION_LABEL: Record<ClasificacionParadero, string> = {
    [ClasificacionParadero.PRINCIPAL]: 'Principal',
    [ClasificacionParadero.SECUNDARIO]: 'Secundario',
    [ClasificacionParadero.TERMINAL]: 'Terminal',
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private paraderoService: ParaderoService,
    private router: Router,
    private fb: FormBuilder,
    private zone: NgZone
  ) {
    this.paradero = {
      id: 0,
      nombre: '',
      latitud: 5.0569,
      longitud: -75.4870,
      clasificacion: ClasificacionParadero.PRINCIPAL,
    };

    this.configFormGroup();
  }

  ngOnInit(): void {
    const currentUrl = this.activatedRoute.snapshot.url.join('/');

    if (currentUrl.includes('view')) {
      this.mode = 1;
    } else if (currentUrl.includes('create')) {
      this.mode = 2;
    } else if (currentUrl.includes('update')) {
      this.mode = 3;
    }

    if (this.mode === 1) {
      this.theFormGroup.disable();
    }

    const id = this.activatedRoute.snapshot.params['id'];

    if (id) {
      this.paradero.id = Number(id);
      this.getParadero(this.paradero.id);
    }
  }

  ngAfterViewInit(): void {
    this.inicializarMapa();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  configFormGroup(): void {
    this.theFormGroup = this.fb.group({
      id: [{ value: '', disabled: true }],
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      clasificacion: [ClasificacionParadero.PRINCIPAL, [Validators.required]],
      latitud: [null, [Validators.required]],
      longitud: [null, [Validators.required]],
    });
  }

  get getTheFormGroup() {
    return this.theFormGroup.controls;
  }

  private inicializarMapa(): void {
    this.map = L.map('mapa-manage', {
      center: [5.0569, -75.4870],
      zoom: 13,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(this.map);

    if (this.mode !== 1) {
      this.centrarEnMiUbicacion();

      this.map.on('click', (e: L.LeafletMouseEvent) => {
        this.zone.run(() => this.onMapClick(e.latlng.lat, e.latlng.lng));
      });
      this.modoMapa = true;
      this.map.getContainer().style.cursor = 'crosshair';
    }

    setTimeout(() => this.map.invalidateSize(), 200);
  }

  private centrarEnMiUbicacion(): void {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        this.map.setView([lat, lng], 16);

        if (this.mode === 2) {
          this.zone.run(() => this.onMapClick(lat, lng));
        }
      },
      (error) => {
        console.warn('Error obteniendo geolocalización', error);

        if (this.mode === 2) {
          this.zone.run(() => this.onMapClick(5.0569, -75.4870));
        }
      },
      { enableHighAccuracy: true }
    );
  }

  private onMapClick(lat: number, lng: number): void {
    this.theFormGroup.patchValue({
      latitud: Number(lat.toFixed(6)),
      longitud: Number(lng.toFixed(6)),
    });

    this.colocarMarcador(lat, lng);
  }

  private colocarMarcador(lat?: number, lng?: number): void {
    if (lat === undefined || lng === undefined) {
      return;
    }

    const latNumber = Number(lat);
    const lngNumber = Number(lng);

    if (this.marcador) {
      this.marcador.setLatLng([latNumber, lngNumber]);
    } else {
      this.marcador = L.marker([latNumber, lngNumber], {
        draggable: this.mode !== 1,
      })
        .addTo(this.map)
        .bindPopup('📍 Paradero seleccionado')
        .openPopup();

      if (this.mode !== 1) {
        this.marcador.on('dragend', (e: L.DragEndEvent) => {
          const marker = e.target as L.Marker;
          const pos = marker.getLatLng();

          this.zone.run(() => {
            this.theFormGroup.patchValue({
              latitud: Number(pos.lat.toFixed(6)),
              longitud: Number(pos.lng.toFixed(6)),
            });
          });
        });
      }
    }

    this.map.setView([latNumber, lngNumber], 16);
  }

  getParadero(id: number): void {
    this.paraderoService.getOne(id).subscribe({
      next: (data) => {
        this.paradero = data;
        this.theFormGroup.patchValue({
          id: data.id,
          nombre: data.nombre,
          clasificacion: data.clasificacion,
          latitud: data.latitud,
          longitud: data.longitud,
        });
        this.colocarMarcador(data.latitud, data.longitud);
      },
      error: () => {
        Swal.fire('Error', 'No se pudo obtener el paradero.', 'error');
      }
    });
  }

  back(): void {
    this.router.navigate(['/paraderos/list']);
  }

  create(): void {
    this.trySend = true;

    if (this.theFormGroup.invalid) {
      Swal.fire('Error!', 'Por favor, complete todos los campos requeridos.', 'error');
      return;
    }

    const { nombre, clasificacion, latitud, longitud } = this.theFormGroup.value;

    const nuevoParadero: Paradero = {
      nombre,
      clasificacion,
      latitud: Number(latitud),
      longitud: Number(longitud),
    };

    this.paraderoService.crear(nuevoParadero).subscribe({
      next: () => {
        Swal.fire('Creado!', 'Paradero creado correctamente.', 'success');
        this.router.navigate(['/paraderos/list']);
      },
      error: () => {
        Swal.fire('Error', 'No se pudo crear el paradero.', 'error');
      }
    });
  }

  update(): void {
    this.trySend = true;

    if (this.theFormGroup.invalid) {
      Swal.fire('Error!', 'Por favor, complete todos los campos requeridos.', 'error');
      return;
    }

    if (!this.paradero.id) {
      Swal.fire('Error', 'No se encontró el ID del paradero.', 'error');
      return;
    }

    const { nombre, clasificacion, latitud, longitud } = this.theFormGroup.value;

    const paraderoActualizado: Paradero = {
      id: this.paradero.id,
      nombre,
      clasificacion,
      latitud: Number(latitud),
      longitud: Number(longitud),
    };

    this.paraderoService.actualizar(this.paradero.id, paraderoActualizado).subscribe({
      next: () => {
        Swal.fire('Actualizado!', 'Paradero actualizado correctamente.', 'success');
        this.router.navigate(['/paraderos/list']);
      },
      error: () => {
        Swal.fire('Error', 'No se pudo actualizar el paradero.', 'error');
      }
    });
  }

  getClasificacionLabel(c?: ClasificacionParadero): string {
    if (!c) {
      return 'Sin clasificación';
    }

    return this.CLASIFICACION_LABEL[c] ?? c;
  }
}
