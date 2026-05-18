import { Component, OnInit } from '@angular/core';

declare var require: any;
const Chart: any = require('chart.js');
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Swal from 'sweetalert2';

import { ReportesService } from 'src/app/services/Reportes/reportes.service';

@Component({
  selector: 'app-rangos-etarios',
  templateUrl: './rangos-etarios.component.html',
  styleUrls: ['./rangos-etarios.component.scss']
})
export class RangosEtariosComponent implements OnInit {

  rutas: any[] = [];
  data: any[] = [];

  predominante: any = null;
  totalPasajeros = 0;

  rutaId?: number;
  fechaInicio?: string;
  fechaFin?: string;

  cargando = false;

  private chartRangos: any;

  constructor(
    private reportesService: ReportesService
  ) {}

  ngOnInit(): void {
    this.cargarReporte();
  }

  cargarReporte(): void {
    this.cargando = true;

    this.reportesService.getRangosEtarios({
      rutaId: this.rutaId,
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin
    }).subscribe({
      next: (res) => {
        this.cargando = false;

        this.data = res.data || [];
        this.rutas = res.rutas || [];
        this.predominante = res.predominante;
        this.totalPasajeros = res.totalPasajeros || 0;

        setTimeout(() => {
          this.crearGrafico();
        }, 100);
      },
      error: (error) => {
        this.cargando = false;

        console.error('Error cargando reporte:', error);

        Swal.fire(
          'Error',
          error.error?.message || 'No se pudo cargar el reporte.',
          'error'
        );
      }
    });
  }

  crearGrafico(): void {
    const canvas = document.getElementById('chart-rangos-etarios') as HTMLCanvasElement;

    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return;
    }

    if (this.chartRangos) {
      this.chartRangos.destroy();
    }

    this.chartRangos = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: this.data.map(item => `${item.rango} (${item.porcentaje}%)`),
        datasets: [
          {
            data: this.data.map(item => item.cantidad),
            backgroundColor: [
              '#f5365c',
              '#fb6340',
              '#5e72e4',
              '#11cdef',
              '#2dce89',
              '#8898aa'
            ],
            borderColor: '#ffffff',
            borderWidth: 2
          }
        ]
      },
      options: {
          responsive: true,
          maintainAspectRatio: false,
          legend: {
            position: 'right',
            labels: {
              fontColor: '#ffffff'
          }
        },
        tooltips: {
          callbacks: {
            label: (tooltipItem, chartData) => {
              const index = tooltipItem.index || 0;
              const item = this.data[index];

              if (!item) {
                return '';
              }

              return `${item.rango}: ${item.cantidad} pasajeros (${item.porcentaje}%)`;
            }
          }
        },
        onClick: (_event: any, elements: any[]) => {
          if (!elements || elements.length === 0) {
            return;
          }

          const index = elements[0]._index;
          const item = this.data[index];

          if (!item) {
            return;
          }

          Swal.fire(
            item.rango,
            `${item.descripcion}<br>Cantidad: ${item.cantidad}<br>Porcentaje: ${item.porcentaje}%`,
            'info'
          );
        }
      }
    });
  }

  limpiarFiltros(): void {
    this.rutaId = undefined;
    this.fechaInicio = undefined;
    this.fechaFin = undefined;

    this.cargarReporte();
  }

  exportarPNG(): void {
    if (!this.chartRangos) {
      Swal.fire(
        'Atención',
        'No hay gráfico para exportar.',
        'warning'
      );
      return;
    }

    const image = this.chartRangos.toBase64Image();

    const link = document.createElement('a');
    link.href = image;
    link.download = 'distribucion-rangos-etarios.png';
    link.click();
  }

  exportarExcel(): void {
    const rows = this.data.map(item => ({
      'Rango etario': item.rango,
      'Descripción': item.descripcion,
      'Cantidad de pasajeros': item.cantidad,
      'Porcentaje': `${item.porcentaje}%`,
      'Variación vs mes anterior': item.variacionMesAnterior
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      'Rangos etarios'
    );

    const buffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });

    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    saveAs(blob, 'distribucion-rangos-etarios.xlsx');
  }

  getProgressClass(index: number): string {
    const clases = [
      'bg-gradient-danger',
      'bg-gradient-warning',
      'bg-gradient-primary',
      'bg-gradient-info',
      'bg-gradient-success',
      'bg-gradient-secondary'
    ];

    return clases[index % clases.length];
  }
}
