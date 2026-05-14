import { Bus } from '../Buses/bus.model';

export interface Ruta {
  id?: number;
  nombre?: string;
  descripcion?: string;
}

export interface ProgramacionRuta {
  id?: number;
  rutaId: number;
  busId: number;
  fechaSalida: string;
  horaSalida: string;
  recurrencia?: 'ninguna' | 'lunes_viernes' | 'fines_semana' | 'diaria';
  toleranciaSalida?: number;
  estado?: 'programado' | 'en_curso' | 'finalizado' | 'cancelado';
  ruta?: Ruta;
  bus?: Bus;
  creadoEn?: Date;
}
