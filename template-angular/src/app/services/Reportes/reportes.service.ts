import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { ReporteIngresosPorMetodo } from '../../models/Reportes/reporte.model';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {

  private url = `${environment.url_ms_business}`;

  constructor(private http: HttpClient) {}

  getRangosEtarios(filtros: {
    rutaId?: number;
    fechaInicio?: string;
    fechaFin?: string;
  }): Observable<any> {
    let params = new HttpParams();

    if (filtros.rutaId) {
      params = params.set('rutaId', filtros.rutaId);
    }

    if (filtros.fechaInicio) {
      params = params.set('fechaInicio', filtros.fechaInicio);
    }

    if (filtros.fechaFin) {
      params = params.set('fechaFin', filtros.fechaFin);
    }

    return this.http.get<any>(
      `${this.url}/reportes/rangos-etarios`,
      { params }
    );
  }

  getIngresosPorMetodo(meses: number): Observable<ReporteIngresosPorMetodo> {
    return this.http.get<ReporteIngresosPorMetodo>(
      `${this.url}/boletos/reportes/ingresos-por-metodo?meses=${meses}`,
      { observe: 'body' }
    );
  }

  exportarCSV(data: ReporteIngresosPorMetodo): void {
    const filas: string[] = [];

    filas.push(['Mes', ...data.tipos].join(','));

    for (const mes of data.meses) {
      const fila = [mes, ...data.tipos.map(t => data.datos[mes]?.[t] ?? 0)];
      filas.push(fila.join(','));
    }

    filas.push(['TOTAL', ...data.tipos.map(t => data.totalesPorMetodo[t] ?? 0)].join(','));
    filas.push([`Total General: $${data.totalGeneral}`].join(','));

    const blob = new Blob([filas.join('\n')], {
      type: 'text/csv;charset=utf-8;'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `reporte-ingresos-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  }

  getTendenciaIncidentes(filtros: {
    meses?: number;
    empresaId?: number;
  }): Observable<any> {
    let params = new HttpParams();

    params = params.set('meses', String(filtros.meses || 3));

    if (filtros.empresaId) {
      params = params.set('empresaId', String(filtros.empresaId));
    }

    return this.http.get<any>(
      `${this.url}/reportes/tendencia-incidentes`,
      { params }
    );
  }
}
