export interface FotoIncidente {
  id?: number;
  urlFoto?: string;
  descripcion?: string;
}

export interface Incidente {
  id?: number;
  tipo: 'mecanico' | 'accidente' | 'retraso' | 'otro';
  gravedad: 'bajo' | 'medio' | 'alto' | 'critico';
  descripcion?: string;
  conductorId?: number;
  turnoId?: number;
  estado?: 'pendiente' | 'en_revision' | 'resuelto';
  comentario?: string | null;
  timestamp?: string;
  incidenteBusId?: number;
  fotos?: FotoIncidente[];
}

export interface StatsIncidente {
  total: number;
  resueltos: number;
  tasaResolucion: number;
  porTipo: Record<string, number>;
}
