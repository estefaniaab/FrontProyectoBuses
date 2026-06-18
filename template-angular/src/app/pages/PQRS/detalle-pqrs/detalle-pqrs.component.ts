import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PqrsService } from 'src/app/services/PQRS/pqrs.service';
import { PQRS } from 'src/app/models/PQRS/pqrs.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-detalle-pqrs',
  templateUrl: './detalle-pqrs.component.html',
})
export class DetallePqrsComponent implements OnInit {
  pqrs?: PQRS;
  loading = true;
  esModoEdicion = false;

  nuevoEstado = '';
  respuestaAdmin = '';
  guardando = false;

  constructor(
    private route: ActivatedRoute,
    private pqrsService: PqrsService,
    private router: Router
  ) {}

  ngOnInit(): void {
      const radicado = this.route.snapshot.paramMap.get('radicado');
      this.esModoEdicion = this.router.url.includes('editar');

      if (radicado) {
        this.cargarDetalle(radicado);
      }
    }

  cargarDetalle(radicado: string): void {
      this.loading = true;
      this.pqrsService.view(radicado).subscribe({
        next: (resp: any) => { // Usamos any temporalmente para extraer los datos con seguridad
          // Si tu backend mete la respuesta dentro de una propiedad 'data', extraela:
          const data = resp.data ? resp.data : resp;

          this.pqrs = data;

          // Mapeo seguro del estado
          const estadoDb = data.estado || '';
          if (estadoDb.toUpperCase() === 'ENVIADO') this.nuevoEstado = 'Enviado';
          else if (estadoDb.toUpperCase() === 'EN_REVISION' || estadoDb.toUpperCase() === 'EN REVISIÓN') this.nuevoEstado = 'En Revisión';
          else if (estadoDb.toUpperCase() === 'RESUELTO') this.nuevoEstado = 'Resuelto';
          else if (estadoDb.toUpperCase() === 'CANCELADO' || estadoDb.toUpperCase() === 'RECHAZADO') this.nuevoEstado = 'Cancelado';
          else this.nuevoEstado = '';

          this.respuestaAdmin = data.respuesta || '';
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          console.error('Error al cargar detalle del PQRS:', err);
          Swal.fire('Error', 'No se pudo obtener la información de este radicado.', 'error');
        },
      });
    }

  guardarCambios(): void {
      if (!this.pqrs || !this.pqrs.radicado) return;

      if (!this.nuevoEstado) {
        Swal.fire('Atención', 'Debes seleccionar un estado válido.', 'warning');
        return;
      }

      if (this.nuevoEstado === 'Resuelto' && (!this.respuestaAdmin || this.respuestaAdmin.trim() === '')) {
        Swal.fire({
          title: 'Respuesta Obligatoria',
          text: 'Para marcar un radicado como "Resuelto" es obligatorio escribir una respuesta o solución para el usuario.',
          icon: 'warning'
        });
        return;
      }

      this.guardando = true;

      // 🟢 CORRECCIÓN: Adaptar el string al formato estricto que pide tu backend
      let estadoParaBackend = '';
      if (this.nuevoEstado === 'Enviado') estadoParaBackend = 'Enviado';
      else if (this.nuevoEstado === 'En Revisión') estadoParaBackend = 'En revision'; // Sin tilde y con minúscula
      else if (this.nuevoEstado === 'Resuelto') estadoParaBackend = 'Resuelto';
      else estadoParaBackend = this.nuevoEstado; // Por si manejas 'En proceso' u otros

      const payload = {
        estado: estadoParaBackend,
        respuesta: this.respuestaAdmin
      };

      this.pqrsService.updateEstado(this.pqrs.radicado, payload).subscribe({
        next: () => {
          this.guardando = false;
          Swal.fire('¡Éxito!', 'El PQRS ha sido actualizado y se notificó al usuario.', 'success');
          this.cargarDetalle(this.pqrs!.radicado!);
        },
        error: (err) => {
          this.guardando = false;
          console.error('Error al actualizar:', err);
          const mensajeError = err.error?.message || 'No se pudo actualizar el estado del PQRS.';
          Swal.fire({
            title: 'Error 400',
            text: Array.isArray(mensajeError) ? mensajeError.join(', ') : mensajeError,
            icon: 'error'
          });
        }
      });
    }
  regresar(): void {
      if (this.router.url.includes('admin')) {
        this.router.navigate(['/pqrs/admin']);
      } else {
        this.router.navigate(['/pqrs/consultar']);
      }
    }
}
