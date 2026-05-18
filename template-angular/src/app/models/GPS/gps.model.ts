import { Bus } from '../Buses/bus.model';

export class Gps {
  id?: number;
  codigo?: string;

  busId?: number;
  bus?: Bus;

  latitud?: number;
  longitud?: number;
  velocidad?: number;
  rumbo?: number;

  ultimaActualizacion?: Date;
  activo?: boolean;

  creadoEn?: Date;
  actualizadoEn?: Date;
}
