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
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  rutas: Ruta[] = [];
  rutasFiltradas: Ruta[] = [];
  filtroNombre: string = '';
  focus = false;
  rutaSeleccionada: Ruta | null = null;
  nodosRuta: Nodo[] = [];
  showParaderosRutaModal = false;
  loadingParaderosRuta = false;
  errorParaderosRuta = '';

  private mapaParaderosRuta?: L.Map;
  private lineaRuta?: L.Polyline;
  private marcadoresParaderosRuta: L.Marker[] = [];



  constructor(
    private rutasService: RutaService,
    private nodoService: NodoService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.list();
  }

  list() {
    this.rutasService.list(this.filtroNombre).subscribe({
      next: (rutas) => {
        this.rutas = rutas;
      }
    });
  }

  filtrarRutas() {
    this.list();
  }

  create() {
    this.router.navigate(['/rutas/create']);
  }

  view(id: string) {
    this.router.navigate(['/rutas/view/' + id]);
  }

  edit(id: string) {
    this.router.navigate(['/rutas/update/' + id]);
  }

  delete(id: string) {
    Swal.fire({
      title: 'Eliminar',
      text: "Está seguro que quiere eliminar el registro?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.rutasService.delete(id).subscribe(() => {
          Swal.fire(
            'Eliminado!',
            'Registro eliminado correctamente.',
            'success'
          );
          this.list();
        });
      }
    });
  }
  openParaderosRutaModal(ruta: Ruta): void {
    if (!ruta.id) return;

    this.rutaSeleccionada = ruta;
    this.nodosRuta = [];
    this.errorParaderosRuta = '';
    this.loadingParaderosRuta = true;
    this.showParaderosRutaModal = true;

    this.nodoService.getByRuta(ruta.id).subscribe({
      next: (data) => {
        this.nodosRuta = data.sort(
          (a, b) => (a.orden ?? 0) - (b.orden ?? 0)
        );

        this.loadingParaderosRuta = false;

        setTimeout(() => {
          this.inicializarMapaParaderosRuta();
          this.pintarParaderosRutaEnMapa();
        }, 100);
      },
      error: () => {
        this.errorParaderosRuta = 'No se pudieron cargar los paraderos de esta ruta.';
        this.loadingParaderosRuta = false;
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
      center: [5.0569, -75.4870],
      zoom: 13,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(this.mapaParaderosRuta);

    setTimeout(() => {
      this.mapaParaderosRuta?.invalidateSize();
    }, 200);
  }

  private pintarParaderosRutaEnMapa(): void {
    if (!this.mapaParaderosRuta) return;

    this.limpiarCapasParaderosRuta();

    const nodosValidos = this.nodosRuta
      .filter((nodo) =>
        nodo.paradero &&
        nodo.paradero.latitud !== undefined &&
        nodo.paradero.longitud !== undefined
      )
      .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));

    const posiciones: L.LatLngExpression[] = nodosValidos.map((nodo) => [
      Number(nodo.paradero!.latitud),
      Number(nodo.paradero!.longitud),
    ]);

    if (posiciones.length === 0) {
      return;
    }

    this.lineaRuta = L.polyline(posiciones, {
      weight: 5,
      opacity: 0.8,
    }).addTo(this.mapaParaderosRuta);

    nodosValidos.forEach((nodo) => {
      const paradero = nodo.paradero!;

      const icon = L.divIcon({
        className: '',
        html: `
          <div style="
            width:30px;
            height:30px;
            background:#2563eb;
            border:2px solid #fff;
            border-radius:50%;
            display:flex;
            align-items:center;
            justify-content:center;
            font-weight:800;
            font-size:13px;
            color:#fff;
            box-shadow:0 2px 6px rgba(0,0,0,0.3);
          ">
            ${nodo.orden ?? ''}
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      const marker = L.marker(
        [Number(paradero.latitud), Number(paradero.longitud)],
        { icon }
      )
        .addTo(this.mapaParaderosRuta!)
        .bindPopup(`
          <strong>${nodo.orden}. ${paradero.nombre}</strong><br>
          <span>${paradero.clasificacion ?? ''}</span>
        `);

      this.marcadoresParaderosRuta.push(marker);
    });

    this.mapaParaderosRuta.fitBounds(this.lineaRuta.getBounds(), {
      padding: [40, 40],
    });
  }

  private limpiarCapasParaderosRuta(): void {
    if (!this.mapaParaderosRuta) return;

    if (this.lineaRuta) {
      this.mapaParaderosRuta.removeLayer(this.lineaRuta);
      this.lineaRuta = undefined;
    }

    this.marcadoresParaderosRuta.forEach((marker) => {
      this.mapaParaderosRuta?.removeLayer(marker);
    });

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
