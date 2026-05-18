import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import Swal from 'sweetalert2';

import { Historial } from 'src/app/models/Historial/historial.model';
import { HistorialService } from 'src/app/services/Historial/historial.service';
import { UserService } from 'src/app/services/User/user.service';

@Component({
  selector: 'app-admin-detalle-historial',
  templateUrl: './admin-detalle.component.html',
  styleUrls: ['./admin-detalle.component.scss']
})
export class AdminDetalleComponent implements OnInit {

  ciudadanoId!: number;
  nombreUsuario = 'Cargando...';

  historial: Historial[] = [];
  historialAgrupado: any[] = [];

  returnUrl = '/historial/admin';

  constructor(
    private historialService: HistorialService,
    private userService: UserService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.returnUrl = history.state?.returnUrl || '/historial/admin';
    this.ciudadanoId = Number(this.activatedRoute.snapshot.params['ciudadanoId']);

    this.cargarHistorial();
  }

  cargarHistorial(): void {
    this.historialService.findByCiudadano(this.ciudadanoId).subscribe({
      next: (data) => {
        this.historial = data;
        this.agruparPorBoleto();
        this.cargarNombreUsuario();
      },
      error: (error) => {
        console.error('Error cargando historial del ciudadano:', error);

        Swal.fire(
          'Error',
          error.error?.message || 'No se pudo cargar el historial del ciudadano.',
          'error'
        );
      }
    });
  }

  cargarNombreUsuario(): void {
    const usuarioId = (this.historial[0] as any)?.boleto?.ciudadano?.usuarioId;

    if (!usuarioId) {
      this.nombreUsuario = `Ciudadano #${this.ciudadanoId}`;
      return;
    }

    this.userService.view(usuarioId).subscribe({
      next: (usuario: any) => {
        this.nombreUsuario =
          usuario?.name ||
          usuario?.username ||
          usuario?.email ||
          usuarioId;
      },
      error: () => {
        this.nombreUsuario = usuarioId;
      }
    });
  }

  agruparPorBoleto(): void {
    const mapa = new Map<number, any>();

    for (const item of this.historial as any[]) {
      const boletoId = item.boletoId;

      if (!boletoId) {
        continue;
      }

      if (!mapa.has(boletoId)) {
        mapa.set(boletoId, {
          boletoId,
          ruta:
            item.boleto?.programacionRuta?.ruta?.nombre ||
            item.nodo?.ruta?.nombre ||
            'Sin ruta',
          abordaje: null,
          descenso: null,
          fechaAbordaje: null,
          fechaDescenso: null,
        });
      }

      const registro = mapa.get(boletoId);

      const nombreParadero =
        item.nodo?.paradero?.nombre ||
        `Nodo #${item.nodoId || item.nodo?.id}`;

      if (item.tipo === 'abordaje') {
        registro.abordaje = nombreParadero;
        registro.fechaAbordaje = item.fechaValidacion;
      }

      if (item.tipo === 'descenso') {
        registro.descenso = nombreParadero;
        registro.fechaDescenso = item.fechaValidacion;
      }
    }

    this.historialAgrupado = Array.from(mapa.values());
  }

  verRecorrido(boletoId: number | undefined): void {
    if (!boletoId) return;

    this.router.navigate(['/historial/recorrido', boletoId], {
      state: {
        returnUrl: `/historial/admin/ciudadano/${this.ciudadanoId}`
      }
    });
  }

  back(): void {
    this.router.navigateByUrl(this.returnUrl);
  }
}
