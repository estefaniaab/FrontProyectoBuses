import { DestinatarioPersona } from '../Destinatario-Persona/destinatario-persona.model';

export class Mensaje {
  id: number;
  emisorId: string;
  contenido: string;
  latitud: number | null;
  longitud: number | null;
  fechaEnvio: Date;
  destinatariosPersona: DestinatarioPersona[];
}
