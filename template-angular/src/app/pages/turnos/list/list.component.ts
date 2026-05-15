import { Component, OnInit } from '@angular/core';
import { Turno } from 'src/app/models/Turnos/turnos.model';
import { TurnosService } from 'src/app/services/Turnos/turnos.servicie';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  turnos: Turno[] = [];

  constructor(private service: TurnosService) {}

  ngOnInit(): void {
    this.list();
  }

  list(): void {
    this.service.findAll().subscribe({
      next: (data) => (this.turnos = data),
      error: (err) => console.error('Error al obtener turnos', err)
    });
  }

  // HU-ENTR-2-006: Iniciar turno con confirmación de estado del bus
  confirmarInicio(turno: Turno): void {
    Swal.fire({
      title: `Iniciar Turno #${turno.id}`,
      html: `
        <div style="text-align:left; margin-top:12px">
          <label style="font-weight:600; margin-bottom:4px; display:block">Estado del Bus:</label>
          <select id="swal-estado" class="swal2-select" style="width:100%; margin-bottom:12px; padding:8px; border-radius:4px; border:1px solid #ccc">
            <option value="operativo">✅ Operativo</option>
            <option value="mantenimiento">⚠️ Requiere Mantenimiento / Observaciones</option>
          </select>
          <label style="font-weight:600; margin-bottom:4px; display:block">Observaciones:</label>
          <textarea id="swal-obs" class="swal2-textarea" style="width:100%; padding:8px"
            placeholder="Obligatorio si el bus no está operativo..."></textarea>
        </div>
      `,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Confirmar e Iniciar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#2dce89',
      preConfirm: () => {
        const estadoBus = (document.getElementById('swal-estado') as HTMLSelectElement).value;
        const observaciones = (document.getElementById('swal-obs') as HTMLTextAreaElement).value.trim();
        if (estadoBus !== 'operativo' && !observaciones) {
          Swal.showValidationMessage('Las observaciones son obligatorias cuando el bus no está operativo');
          return false;
        }
        return { estadoBus, observaciones: observaciones || undefined };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.service.iniciarTurno(turno.id!, result.value).subscribe({
          next: () => {
            Swal.fire('¡Turno Iniciado!', 'El GPS del bus está activo.', 'success');
            this.list();
          },
          error: (err) => {
            const msg = typeof err.error?.message === 'string'
              ? err.error.message
              : Array.isArray(err.error?.message)
                ? err.error.message.join(', ')
                : 'No se pudo procesar el turno.';
            Swal.fire('Error', msg, 'error');
          }        });
      }
    });
  }

  // Finalizar turno y apagar GPS
  confirmarFin(turno: Turno): void {
    Swal.fire({
      title: '¿Finalizar Turno?',
      text: `Se liberará el bus ${turno.bus?.placa ?? ''} y se apagará el GPS.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, finalizar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#f5365c'
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.finalizarTurno(turno.id!).subscribe({
          next: () => {
            Swal.fire('Finalizado', 'El turno ha concluido correctamente.', 'success');
            this.list();
          },
          error: (err) => {
            const msg = typeof err.error?.message === 'string'
              ? err.error.message
              : Array.isArray(err.error?.message)
                ? err.error.message.join(', ')
                : 'No se pudo procesar el turno.';
            Swal.fire('Error', msg, 'error');
          }        });
      }
    });
  }

  delete(turno: Turno): void {
    if (turno.estadoTurno !== 'pendiente') {
      Swal.fire('No permitido', 'Solo se pueden eliminar turnos en estado pendiente.', 'warning');
      return;
    }
    Swal.fire({
      title: '¿Eliminar turno?',
      text: 'Esta acción eliminará la programación del turno.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#f5365c'
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.remove(turno.id!).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Turno eliminado correctamente.', 'success');
            this.list();
          },
          error: (err) => Swal.fire('Error', err.error?.message || 'No se pudo eliminar', 'error')
        });
      }
    });
  }
}
