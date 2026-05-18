import { Component, OnInit, OnDestroy } from '@angular/core';
import { ReportesService }              from 'src/app/services/Reportes/reportes.service';
import { ReporteIngresosPorMetodo }     from 'src/app/models/Reportes/reporte.model';

declare var Chart: any;

@Component({
  selector:    'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls:   ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  meses = 6;
  reporte?: ReporteIngresosPorMetodo;
  cargando = false;
  private chart: any;

  colores = [
    'rgba(255, 99, 132, 0.8)',
    'rgba(54, 162, 235, 0.8)',
    'rgba(255, 206, 86, 0.8)',
    'rgba(75, 192, 192, 0.8)',
    'rgba(153, 102, 255, 0.8)',
  ];

  constructor(private reportesService: ReportesService) {}

  ngOnInit(): void { this.cargar(); }

  ngOnDestroy(): void {
    if (this.chart) this.chart.destroy();
  }

  cargar(): void {
    this.cargando = true;
    if (this.chart) { this.chart.destroy(); this.chart = null; }

    this.reportesService.getIngresosPorMetodo(this.meses).subscribe({
      next: (data) => {
        this.reporte = data;
        this.cargando = false;
        setTimeout(() => this.renderChart(), 100);
      },
      error: (err) => {
        console.error('Error al cargar reporte', err);
        this.cargando = false;
      },
    });
  }

  renderChart(): void {
    if (!this.reporte) return;
    const canvas = document.getElementById('chartIngresos') as HTMLCanvasElement;
    if (!canvas) return;

    const datasets = this.reporte.tipos.map((tipo, i) => ({
      label: tipo.toUpperCase(),
      backgroundColor: this.colores[i % this.colores.length],
      data: this.reporte!.meses.map(mes => this.reporte!.datos[mes]?.[tipo] ?? 0),
    }));

    this.chart = new Chart(canvas, {
      type: 'bar',
      data: { labels: this.reporte.meses, datasets },
      options: {
        responsive: true,
        scales: {
          xAxes: [{ stacked: true }],
          yAxes: [{ stacked: true, ticks: { beginAtZero: true } }],
        },
        tooltips: {
          callbacks: {
            label: (item: any, data: any) =>
              `${data.datasets[item.datasetIndex].label}: $${Number(item.yLabel).toFixed(2)}`,
          },
        },
      },
    });
  }

  exportar(): void {
    if (this.reporte) this.reportesService.exportarCSV(this.reporte);
  }

  objetoAArray(obj: Record<string, number>): { key: string; value: number }[] {
    return Object.entries(obj).map(([key, value]) => ({ key, value }));
  }
}
