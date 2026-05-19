import { Direccion } from "../Direcciones/direccion.model"
import { MetodoPagoCiudadano } from "../MetodosPagoCiudadano/metodo-pago-ciudadano.model"

export class Ciudadano {
  id?: number;
  usuarioId?: string;
  fechaNacimiento?: string;
  direcciones?: Direccion[];
  metodosPagoCiudadano?: MetodoPagoCiudadano[];
}
