import {MetodoPago } from '../MetodosPago/metodo-pago.model';

export interface MetodoPagoCiudadano {
  id?: number;
  numeroIdentificacion?: string;
  saldo?: number;
  activo?: boolean;
  metodoPago?: MetodoPago;
}
