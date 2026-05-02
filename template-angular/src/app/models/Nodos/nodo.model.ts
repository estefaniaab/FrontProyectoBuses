import { Paradero } from '../Paradero/paradero.model';
import { Ruta } from '../Rutas/ruta.model';

export class Nodo {
  id: number;
  orden: number;
  ruta?: Ruta;
  paradero?: Paradero;
}
