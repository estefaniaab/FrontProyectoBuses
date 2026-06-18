export interface PQRS {
  id?: number;
  radicado?: string;
  tipo: 'Peticion' | 'Queja' | 'Reclamo' | 'Sugerencia';
  categoria: 'Conductor' | 'Bus' | 'Ruta' | 'Tarjeta' | 'Otro';
  descripcion: string;
  usuarioId?: string;
  estado?: 'Enviado' | 'En revision' | 'En proceso' | 'Resuelto';
  respuesta?: string;
  fechaLimite?: Date;
  diasPrometidos?: number;
  alertaEnviada?: boolean;
  supervisorId?: string;
  fotos?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}
