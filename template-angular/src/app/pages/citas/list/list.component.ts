import { Component, OnInit } from '@angular/core';
import { CitasService } from 'src/app/services/Citas/citas.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  listaCitas: any[] = [];
  cargando = false;

  constructor(private service: CitasService) {}

  ngOnInit(): void {
    this.cargarCitas();
  }

  cargarCitas() {
    this.cargando = true;
    this.service.misCitas().subscribe({
      next: (data) => {
        this.listaCitas = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al obtener citas:', err);
        this.cargando = false;
      }
    });
  }

  cancelarCita(id: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción cancelará tu cita de forma definitiva.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f5365c',
      cancelButtonColor: '#eceeef',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'Volver'
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.cancelar(id.toString()).subscribe({
          next: () => {
            Swal.fire('¡Cancelada!', 'Tu cita ha sido cancelada exitosamente.', 'success');
            this.cargarCitas(); // Recarga reactiva de la tabla
          },
          error: (err) => {
            Swal.fire('Error', 'No se pudo cancelar la cita en este momento.', 'error');
          }
        });
      }
    });
  }
}
