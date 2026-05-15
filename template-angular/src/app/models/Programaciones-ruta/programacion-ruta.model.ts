import { Bus } from '../Buses/bus.model';
import { Ruta } from '../Rutas/ruta.model';

export interface ProgramacionRuta {
  id?: number;
  rutaId: number;
  busId: number;
  fechaSalida: string;
  horaSalida: string;
  recurrencia?: 'ninguna' | 'lunes_viernes' | 'fines_semana' | 'diaria';
  toleranciaSalida?: number;
  estado?: 'programado' | 'en_curso' | 'finalizado' | 'cancelado';
  ruta?: Ruta;   // ← ahora usa la clase real con tarifa
  bus?: Bus;     // ← ahora usa la clase real con capacidadMaximaPasajeros
  creadoEn?: Date;
}
