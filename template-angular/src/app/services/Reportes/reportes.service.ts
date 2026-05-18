import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ReporteIngresosPorMetodo } from '../../models/Reportes/reporte.model';

@Injectable({ providedIn: 'root' })
export class ReportesService {
  private url = `${environment.url_ms_business}/boletos/reportes`;

  constructor(private http: HttpClient) {}

  getIngresosPorMetodo(meses: number): Observable<ReporteIngresosPorMetodo> {
    return this.http.get<ReporteIngresosPorMetodo>(
      `${this.url}/ingresos-por-metodo?meses=${meses}`,
      { observe: 'body' }
    );
  }

  exportarCSV(data: ReporteIngresosPorMetodo): void {
    const filas: string[] = [];

    // Encabezado
    filas.push(['Mes', ...data.tipos].join(','));

    // Datos por mes
    for (const mes of data.meses) {
      const fila = [mes, ...data.tipos.map(t => data.datos[mes]?.[t] ?? 0)];
      filas.push(fila.join(','));
    }

    // Totales
    filas.push(['TOTAL', ...data.tipos.map(t => data.totalesPorMetodo[t] ?? 0)].join(','));
    filas.push([`Total General: $${data.totalGeneral}`].join(','));

    const blob = new Blob([filas.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href     = url;
    link.download = `reporte-ingresos-${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
