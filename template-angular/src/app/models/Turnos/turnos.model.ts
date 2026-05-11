import { Bus } from '../Buses/bus.model';

export interface Turno {
  id?: number;
  conductorId: number;   // ← number, igual que el backend
  busId: number;
  horaInicio: string | Date;
  horaFin: string | Date;
  estadoTurno?: 'pendiente' | 'en_curso' | 'finalizado';
  estadoBus?: string;
  observaciones?: string;
  horaRealInicio?: Date;
  horaRealFin?: Date;

  bus?: Bus;
}
