export class Mensaje {
  id: number;
  emisorId: string;
  destinatarioId: string;
  contenido: string;
  leido: boolean;
  fechaLeido: Date | null;
  latitud: number | null;
  longitud: number | null;
  fechaEnvio: Date;
}
