import { Component, OnInit, OnDestroy, AfterViewInit, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Paradero } from 'src/app/models/Paradero/paradero.model';
import { ParaderoService } from 'src/app/services/Paradero/paradero.service';
import Swal from 'sweetalert2';
import * as L from 'leaflet';

// Fix íconos Leaflet con webpack
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

  mode: number; // 1: view, 2: create, 3: update
  paradero: Paradero;
  theFormGroup: FormGroup;
  trySend: boolean;

  // Mapa
  private map!: L.Map;
  private marcador: L.Marker | null = null;
  modoMapa = false; // true cuando el usuario puede hacer clic para ubicar

  readonly CLASIFICACIONES = ['principal', 'secundario', 'terminal'];

  constructor(
    private activatedRoute: ActivatedRoute,
    private paraderoService: ParaderoService,
    private router: Router,
    private fb: FormBuilder,
    private zone: NgZone
  ) {
    this.trySend = false;
    this.paradero = { id: 0, nombre: '', latitud: 0, longitud: 0, clasificacion: 'principal' };
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

    if (this.activatedRoute.snapshot.params['id']) {
      this.paradero.id = +this.activatedRoute.snapshot.params['id'];
      this.getParadero(this.paradero.id);
    }
  }

  ngAfterViewInit(): void {
    this.inicializarMapa();
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  // ─── FORMULARIO ───────────────────────────────────────────────────────────

  configFormGroup() {
    this.theFormGroup = this.fb.group({
      id:            [{ value: '', disabled: true }],
      nombre:        ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      clasificacion: ['', [Validators.required]],
      latitud:       [null, [Validators.required]],
      longitud:      [null, [Validators.required]],
    });
  }

  get getTheFormGroup() {
    return this.theFormGroup.controls;
  }

  // ─── MAPA ─────────────────────────────────────────────────────────────────
  private inicializarMapa(): void {
    // Centro por defecto si falla la geolocalización
    this.map = L.map('mapa-manage', {
      center: [6.2442, -75.5812],
      zoom: 13,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(this.map);

    // Solo habilitar ubicación y clics si NO es modo vista
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
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          // Centramos la vista
          this.map.setView([lat, lng], 16);

          // Si es un nuevo paradero (modo 2), marcamos el punto de una vez
          if (this.mode === 2) {
            this.zone.run(() => this.onMapClick(lat, lng));
          }
        },
        (error) => {
          console.warn('Error obteniendo geolocalización', error);
        },
        { enableHighAccuracy: true }
      );
    }
  }

  // ESTE MÉTODO FALTABA
  private onMapClick(lat: number, lng: number): void {
    this.theFormGroup.patchValue({ latitud: lat, longitud: lng });
    this.colocarMarcador(lat, lng);
  }

  // ESTE MÉTODO TAMBIÉN FALTABA
  private colocarMarcador(lat: number, lng: number): void {
    if (this.marcador) {
      this.marcador.setLatLng([lat, lng]);
    } else {
      this.marcador = L.marker([lat, lng], { draggable: this.mode !== 1 })
        .addTo(this.map)
        .bindPopup('📍 Paradero seleccionado')
        .openPopup();

      if (this.mode !== 1) {
        this.marcador.on('dragend', (e: any) => {
          const pos = e.target.getLatLng();
          this.zone.run(() => {
            this.theFormGroup.patchValue({ latitud: pos.lat, longitud: pos.lng });
          });
        });
      }
    }
    this.map.setView([lat, lng], 16);
  }
  // ─── CRUD ─────────────────────────────────────────────────────────────────

  getParadero(id: number) {
    this.paraderoService.getOne(id).subscribe({
      next: (data) => {
        this.paradero = data;
        this.theFormGroup.patchValue({
          id:            data.id,
          nombre:        data.nombre,
          clasificacion: data.clasificacion,
          latitud:       data.latitud,
          longitud:      data.longitud,
        });
        // Mostrar en el mapa
        this.colocarMarcador(data.latitud, data.longitud);
      },
      error: () => {
        Swal.fire('Error', 'No se pudo obtener el paradero.', 'error');
      }
    });
  }

  back() {
    this.router.navigate(['/paraderos/list']);
  }

  create() {
    this.trySend = true;
    if (this.theFormGroup.invalid) {
      Swal.fire('Error!', 'Por favor, complete todos los campos requeridos.', 'error');
      return;
    }
    const { nombre, clasificacion, latitud, longitud } = this.theFormGroup.value;
    this.paraderoService.crear({ nombre, clasificacion, latitud, longitud }).subscribe({
      next: () => {
        Swal.fire('Creado!', 'Paradero creado correctamente.', 'success');
        this.router.navigate(['/paraderos/list']);
      },
      error: () => {
        Swal.fire('Error', 'No se pudo crear el paradero.', 'error');
      }
    });
  }

  update() {
    this.trySend = true;
    if (this.theFormGroup.invalid) {
      Swal.fire('Error!', 'Por favor, complete todos los campos requeridos.', 'error');
      return;
    }
    const { nombre, clasificacion, latitud, longitud } = this.theFormGroup.value;
    this.paraderoService.actualizar(this.paradero.id, { nombre, clasificacion, latitud, longitud }).subscribe({
      next: () => {
        Swal.fire('Actualizado!', 'Paradero actualizado correctamente.', 'success');
        this.router.navigate(['/paraderos/list']);
      },
      error: () => {
        Swal.fire('Error', 'No se pudo actualizar el paradero.', 'error');
      }
    });
  }
}
