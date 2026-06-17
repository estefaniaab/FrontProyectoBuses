import { TipoAtencion }from './tipo-atencion.enum';
import { TipoConsulta }from './tipo-consulta.enum';
import { EstadoCita }from './estado-cita.enum';

export class Cita {

  id?: number;
  usuarioId?: string;
  tipoAtencion?: TipoAtencion;
  tipoConsulta?: TipoConsulta;
  fechaHora?: string;
  motivo?: string;
  eventoGoogleId?: string;
  estado?: EstadoCita;
  createdAt?: Date;
  updatedAt?: Date;

}
