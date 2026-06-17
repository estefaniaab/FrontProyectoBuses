export interface Grupo {
  id?: number;
  nombre: string;
  descripcion?: string;
  esPublico: boolean;
  creadorUsuarioId: string;
  activo: boolean;
  fechaCreacion?: string;
  fechaActualizacion?: string;
  totalMiembros?: number;
  fotoUrl?: string;
}


export interface MembresiaGrupo {
  id?: number;
  grupoId: number;
  usuarioId: string;
  nombreUsuario?: string;  // FIX: nombre desde ms-security
  rol: RolMembresia;
  estado: EstadoMembresia;
  fechaUnion?: string;
}

export enum RolMembresia {
  MIEMBRO       = 'miembro',
  ADMINISTRADOR = 'administrador',
}

export enum EstadoMembresia {
  ACTIVO    = 'activo',
  BLOQUEADO = 'bloqueado',
  INACTIVO  = 'inactivo',

}

export interface LogMembresiaGrupo {
  id?: number;
  grupoId: number;
  usuarioAfectadoId: string;
  nombreAfectado?: string;  // FIX: nombre desde ms-security
  usuarioActorId?: string;
  nombreActor?: string;     // FIX: nombre desde ms-security
  accion: AccionLog;
  fechaAccion?: string;
}

export enum AccionLog {
  UNION     = 'union',
  SALIDA    = 'salida',
  PROMOVIDO = 'promovido',
  REMOVIDO  = 'removido',
  BLOQUEADO = 'bloqueado',
}

export interface Notificacion {
  id?: number;
  usuarioId: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  leido: boolean;
  referenciaId?: number;
  fechaCreacion?: string;
}
export interface VerificarMembresiaResponse {
  esMiembro: boolean;
  soloLectura: boolean;
}
