import { ProgramacionRuta } from '../Programaciones-ruta/programacion-ruta.model';

export interface ParaderoBasic {
  id?: number;
  nombre?: string;
  clasificacion?: string;
}

export interface MetodoPagoBasic {
  id?: number;
  nombre?: string;
  tipo?: string;
}

export interface MetodoPagoCiudadanoBasic {
  id?: number;
  numeroIdentificacion?: string;
  saldo?: number;
  activo?: boolean;
  metodoPago?: MetodoPagoBasic;
}

export interface Boleto {
  id?: number;
  ciudadanoId: number;
  programacionRutaId: number;
  metodoPagoCiudadanoId: number;
  paraderoAbordajeId: number;
  paraderoDescensoId?: number;
  montoTarifa: number;
  saldoRestante?: number | null;
  timestampAbordaje?: string;
  timestampDescenso?: string;
  estado?: 'activo' | 'completado' | 'cancelado';
  creadoEn?: Date;
  // Relaciones
  ciudadano?: { id?: number; usuarioId?: string };
  programacionRuta?: ProgramacionRuta;
  metodoPagoCiudadano?: MetodoPagoCiudadanoBasic;
  paraderoAbordaje?: ParaderoBasic;
  paraderoDescenso?: ParaderoBasic;
}

export interface AbordajeResponse {
  boleto: Boleto;
  saldoRestante: number | null;
  mensaje: string;
}

export interface DescensoResponse {
  boleto: Boleto;
  mensaje: string;
}
