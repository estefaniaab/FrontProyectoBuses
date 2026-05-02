import { ClasificacionParadero } from './clasificacion-paradero.enum';

export class Paradero {
  id?: number;
  nombre?: string;
  latitud?: number;
  longitud?: number;
  clasificacion?: ClasificacionParadero;

  // Solo para endpoint de cercanos
  distancia_metros?: number;
}
