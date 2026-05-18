import { Boleto } from '../Boletos/boleto.model';
import { Nodo } from '../Nodos/nodo.model';

export class Historial {
  id?: number;
  boletoId?: number;
  nodoId?: number;
  tipo?: string;
  fechaValidacion?: Date;

  boleto?: Boleto;
  nodo?: Nodo;
}
