export interface ReporteIngresosPorMetodo {
  meses: string[];
  tipos: string[];
  datos: Record<string, Record<string, number>>;
  totalesPorMetodo: Record<string, number>;
  totalGeneral: number;
}
