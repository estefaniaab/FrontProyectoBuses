import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import Swal from 'sweetalert2';

import { Historial } from 'src/app/models/Historial/historial.model';
import { HistorialService } from 'src/app/services/Historial/historial.service';

@Component({
  selector: 'app-list-historial',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {

  historial: Historial[] = [];
  historialAgrupado: any[] = [];
  boletoIdFiltro?: number;

  constructor(
    private historialService: HistorialService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.list();
  }

  list(): void {
    this.historialService.list().subscribe({
      next: (data) => {
        this.historial = data;
        this.agruparPorBoleto();
      },
      error: (error) => {
        console.error('Error listando historial:', error);

        Swal.fire(
          'Error',
          error.error?.message || 'No se pudo cargar el historial.',
          'error'
        );
      }
    });
  }

  buscarPorBoleto(): void {
    if (!this.boletoIdFiltro) {
      this.list();
      return;
    }

    this.historialService.findByBoleto(this.boletoIdFiltro).subscribe({
      next: (data) => {
        this.historial = data;
        this.agruparPorBoleto();
      },
      error: (error) => {
        console.error('Error buscando historial por boleto:', error);

        Swal.fire(
          'Error',
          error.error?.message || 'No se pudo buscar el historial del boleto.',
          'error'
        );
      }
    });
  }

  agruparPorBoleto(): void {
    const mapa = new Map<number, any>();

    for (const item of this.historial) {
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
          historialAbordajeId: null,
          historialDescensoId: null,
        });
      }

      const registro = mapa.get(boletoId);

      const nombreParadero =
        item.nodo?.paradero?.nombre ||
        `Nodo #${item.nodoId || item.nodo?.id}`;

      if (item.tipo === 'abordaje') {
        registro.abordaje = nombreParadero;
        registro.fechaAbordaje = item.fechaValidacion;
        registro.historialAbordajeId = item.id;
      }

      if (item.tipo === 'descenso') {
        registro.descenso = nombreParadero;
        registro.fechaDescenso = item.fechaValidacion;
        registro.historialDescensoId = item.id;
      }
    }

    this.historialAgrupado = Array.from(mapa.values());
  }

  limpiar(): void {
    this.boletoIdFiltro = undefined;
    this.list();
  }

  view(id: number | undefined): void {
    if (!id) return;

    this.router.navigate(['/historial/view', id]);
  }

  verRecorrido(boletoId: number | undefined): void {
    if (!boletoId) return;

    this.router.navigate(['/historial/recorrido', boletoId]);
  }
}
