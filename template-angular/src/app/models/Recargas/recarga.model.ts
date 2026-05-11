import { MetodoPagoCiudadano } from '../MetodosPagoCiudadano/metodo-pago-ciudadano.model';

export interface Recarga {
  id?: number;
  metodoPagoCiudadanoId?: number;
  metodoPagoCiudadano?: MetodoPagoCiudadano;
  monto?: number;
  comision?: number;
  totalPagar?: number;
  estado?: string;
  referenciaInterna?: string;
  referenciaEpayco?: string;
  transaccionEpayco?: string;
  aplicada?: boolean;
  payloadEpayco?: any;
  createdAt?: string;
  updatedAt?: string;
  checkoutData?: string;
}
