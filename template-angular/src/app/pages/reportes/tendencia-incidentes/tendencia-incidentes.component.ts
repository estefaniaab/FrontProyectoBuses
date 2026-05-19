import { Component, OnInit } from '@angular/core';

declare var require: any;
const Chart: any = require('chart.js');

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Swal from 'sweetalert2';

import { ReportesService } from 'src/app/services/Reportes/reportes.service';

@Component({
  selector: 'app-tendencia-incidentes',
  templateUrl: './tendencia-incidentes.component.html',
  styleUrls: ['./tendencia-incidentes.component.scss']
})
export class TendenciaIncidentesComponent implements OnInit {

  empresas: any[] = [];

  meses: string[] = [];
  tipos: string[] = [];
  datos: any = {};
  totalesPorTipo: any = {};
  totalesPorMes: any = {};

  totalGeneral = 0;
  tipoPredominante: any = null;
  mesMayor: any = null;

  mesesFiltro = 3;
  empresaId?: number;

  cargando = false;

  private chartTendencia: any;

  private colores = [
    '#f5365c',
    '#fb6340',
    '#5e72e4',
    '#11cdef',
    '#2dce89',
    '#8898aa',
    '#ffd600'
  ];

  constructor(
    private reportesService: ReportesService
  ) {}

  ngOnInit(): void {
    this.cargarReporte();
  }

  cargarReporte(): void {
    if (!this.mesesFiltro || this.mesesFiltro < 3) {
      this.mesesFiltro = 3;
    }

    this.cargando = true;

    this.reportesService.getTendenciaIncidentes({
      meses: this.mesesFiltro,
      empresaId: this.empresaId,
    }).subscribe({
      next: (res) => {
        this.cargando = false;

        this.meses = res.meses || [];
        this.tipos = res.tipos || [];
        this.datos = res.datos || {};
        this.totalesPorTipo = res.totalesPorTipo || {};
        this.totalesPorMes = res.totalesPorMes || {};
        this.totalGeneral = res.totalGeneral || 0;
        this.tipoPredominante = res.tipoPredominante || null;
        this.mesMayor = res.mesMayor || null;
        this.empresas = res.empresas || [];

        setTimeout(() => {
          this.crearGrafico();
        }, 100);
      },
      error: (error) => {
        this.cargando = false;

        console.error('Error cargando tendencia de incidentes:', error);

        Swal.fire(
          'Error',
          error.error?.message || 'No se pudo cargar el reporte.',
          'error'
        );
      }
    });
  }

  crearGrafico(): void {
    const canvas = document.getElementById(
      'chart-tendencia-incidentes'
    ) as HTMLCanvasElement;

    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return;
    }

    if (this.chartTendencia) {
      this.chartTendencia.destroy();
    }

    const datasets = this.tipos.map((tipo, index) => {
      const color = this.colores[index % this.colores.length];

      return {
        label: this.formatearTipo(tipo),
        data: this.meses.map(mes => this.datos[mes]?.[tipo] || 0),
        borderColor: color,
        backgroundColor: color,
        fill: false,
        lineTension: 0.25,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 3,
      };
    });

    this.chartTendencia = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.meses.map(mes => this.formatearMes(mes)),
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
          position: 'bottom',
          labels: {
            fontColor: '#ffffff',
          }
        },
        scales: {
          xAxes: [{
            ticks: {
              fontColor: '#ffffff',
            },
            gridLines: {
              color: 'rgba(255,255,255,0.1)',
            }
          }],
          yAxes: [{
            ticks: {
              fontColor: '#ffffff',
              beginAtZero: true,
              precision: 0,
            },
            gridLines: {
              color: 'rgba(255,255,255,0.1)',
            }
          }]
        },
        tooltips: {
          callbacks: {
            label: (tooltipItem, chartData) => {
              const dataset = chartData.datasets[tooltipItem.datasetIndex];
              return `${dataset.label}: ${tooltipItem.yLabel} incidente(s)`;
            }
          }
        }
      }
    });
  }

  limpiarFiltros(): void {
    this.mesesFiltro = 3;
    this.empresaId = undefined;
    this.cargarReporte();
  }

  exportarPNG(): void {
    if (!this.chartTendencia) {
      Swal.fire(
        'Atención',
        'No hay gráfico para exportar.',
        'warning'
      );
      return;
    }

    const image = this.chartTendencia.toBase64Image();

    const link = document.createElement('a');
    link.href = image;
    link.download = 'tendencia-incidentes.png';
    link.click();
  }

  exportarExcel(): void {
    const rows: any[] = [];

    for (const mes of this.meses) {
      const row: any = {
        Mes: this.formatearMes(mes),
        Total: this.totalesPorMes[mes] || 0,
      };

      for (const tipo of this.tipos) {
        row[this.formatearTipo(tipo)] = this.datos[mes]?.[tipo] || 0;
      }

      rows.push(row);
    }

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      'Tendencia incidentes'
    );

    const buffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });

    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    saveAs(blob, 'tendencia-incidentes.xlsx');
  }

  formatearTipo(tipo: string): string {
    const mapa: any = {
      mecanico: 'Mecánicos',
      accidente: 'Accidentes',
      retraso: 'Retrasos',
      otro: 'Otros',
      problemas_pasajeros: 'Problemas con pasajeros',
    };

    return mapa[tipo] || tipo;
  }

  formatearMes(mes: string): string {
    const partes = mes.split('-');

    if (partes.length !== 2) {
      return mes;
    }

    const year = partes[0];
    const month = Number(partes[1]);

    const nombres = [
      '',
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ];

    return `${nombres[month]} ${year}`;
  }

  getTotalTipo(tipo: string): number {
    return this.totalesPorTipo[tipo] || 0;
  }

  getPorcentajeTipo(tipo: string): number {
    if (!this.totalGeneral) {
      return 0;
    }

    return Number(
      ((this.getTotalTipo(tipo) / this.totalGeneral) * 100).toFixed(2)
    );
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
