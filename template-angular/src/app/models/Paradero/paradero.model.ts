// Modelo base del paradero (sin campos calculados del backend)
export interface Paradero {
  id: number;
  nombre: string;
  latitud: number;
  longitud: number;
  clasificacion: 'principal' | 'secundario' | 'terminal';
}

// Extiende el modelo base con el campo calculado que devuelve /cercanos
export interface ParaderoCercano extends Paradero {
  distancia_metros: number;
}
