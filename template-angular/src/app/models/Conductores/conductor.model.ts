import { Empresa } from '../Empresas/empresa.model';

export class Conductor {
  id?: number;
  userId?: string;
  licencia?: string;
  fechaVencimientoLicencia?: string | Date;
  telefono?: string;
  activo?: boolean;
  empresaId?: number;
  empresa?: Empresa;
}
