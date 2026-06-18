export interface ConfigurarClimaDto {
  activado?: boolean;
  horarioViaje?: string;
  ciudad?: string;
  canalPreferido?: 'email' | 'whatsapp' | 'push';
  telefono?: string;
  email?: string;
}

export interface RespuestaClimaDto {
  success: boolean;
  mensaje: string;
  configuracion?: ConfigurarClimaDto;
}
