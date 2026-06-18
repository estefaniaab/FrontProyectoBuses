import { Component, OnInit } from '@angular/core';
import { ClimaService } from 'src/app/services/Clima/clima.service';
import { ConfigurarClimaDto } from 'src/app/models/Clima/clima.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-clima-config',
  templateUrl: './clima-config.component.html',
})
export class ClimaConfigComponent implements OnInit {

  config: ConfigurarClimaDto = {
    activado: false,
    horarioViaje: '07:00',
    ciudad: '',
    canalPreferido: 'email',
    telefono: ''
  };

  loading = false;

  constructor(private climaService: ClimaService) { }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos() {
    this.climaService.obtenerConfiguracion().subscribe({
      next: (res) => {
        if (res) {
          this.config = {
            activado: res.activado ?? false,
            horarioViaje: res.horarioViaje ?? '07:00',
            ciudad: res.ciudad ?? '',
            canalPreferido: res.canalPreferido ?? 'email',
            telefono: res.telefono ?? ''
          };
        }
      },
      error: (err) => console.error('Error al cargar la configuración de clima:', err)
    });
  }

  guardar() {
    if (this.config.activado) {
      if (!this.config.ciudad?.trim()) {
        Swal.fire('Atención', 'Por favor ingresa tu ciudad de origen para calcular el clima.', 'warning');
        return;
      }
      if (!this.config.horarioViaje) {
        Swal.fire('Atención', 'Debes ingresar un horario habitual de viaje.', 'warning');
        return;
      }
      if (this.config.canalPreferido === 'whatsapp' && !this.config.telefono?.trim()) {
        Swal.fire('Atención', 'Ingresa tu número de teléfono para recibir alertas por WhatsApp.', 'warning');
        return;
      }
    }

    this.loading = true;
    this.climaService.guardarConfiguracion(this.config).subscribe({
      next: (res) => {
        this.loading = false;
        Swal.fire('¡Éxito!', res.mensaje || 'Configuración de clima actualizada.', 'success');
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
        Swal.fire('Error', 'No se pudo guardar la configuración de clima.', 'error');
      }
    });
  }

  probarAlertaYa() {
    if (!this.config.ciudad?.trim()) {
      Swal.fire('Atención', 'Ingresa una ciudad antes de verificar el clima.', 'warning');
      return;
    }

    this.loading = true;
    this.climaService.forzarVerificacion().subscribe({
      next: (res) => {
        this.loading = false;
        Swal.fire(
          '¡Proceso Completado!',
          'Se procesó el estado del tiempo para tu ciudad y se envió la alerta.',
          'success'
        );
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
        Swal.fire('Error', 'No se pudo conectar con el servicio de verificación.', 'error');
      }
    });
  }
}
