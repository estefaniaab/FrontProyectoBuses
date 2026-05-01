import { EstadoBus } from './estado-bus.enum';

export class Bus {
  id?: number;
  placa: string;
  modelo: string;
  anio: number;
  capacidadMaximaPasajeros: number;
  capacidadSentados: number;
  capacidadParados: number;
  estado: EstadoBus;
  fotoUrl?: string;
  codigoQr?: string;
}
