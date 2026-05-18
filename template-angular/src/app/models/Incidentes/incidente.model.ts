export interface FotoIncidente {
  id?: number;
  urlFoto?: string;
  descripcion?: string;
}

export interface BusIncidente {
  id?: number;
  placa?: string;
  modelo?: string;
}

export interface Incidente {
  id?: number;

  tipo: 'mecanico' | 'accidente' | 'retraso' | 'otro';
  gravedad: 'bajo' | 'medio' | 'alto' | 'critico';

  descripcion?: string;

  conductorId?: number;
  turnoId?: number;
  gpsId?: number;

  latitud?: number;
  longitud?: number;
  fechaGps?: string;

  estado?: 'pendiente' | 'en_revision' | 'resuelto';
  comentario?: string | null;

  timestamp?: string;

  incidenteBusId?: number;
  bus?: BusIncidente;

  fotos?: FotoIncidente[];
}

export interface StatsIncidente {
  total: number;
  pendientes: number;
  enRevision: number;
  resueltos: number;
  tasaResolucion: number;
  porTipo: Record<string, number>;
}
