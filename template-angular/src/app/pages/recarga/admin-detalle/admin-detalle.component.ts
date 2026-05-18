import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import Swal from 'sweetalert2';

import { Recarga } from 'src/app/models/Recargas/recarga.model';
import { RecargaService } from 'src/app/services/Recarga/recarga.service';
import { UserService } from 'src/app/services/User/user.service';

@Component({
  selector: 'app-admin-detalle-recargas',
  templateUrl: './admin-detalle.component.html',
  styleUrls: ['./admin-detalle.component.scss']
})
export class AdminDetalleComponent implements OnInit {

  ciudadanoId!: number;
  recargas: Recarga[] = [];
  nombreCiudadano = 'Cargando...';
  returnUrl = '/recargas/admin';

  constructor(
    private recargaService: RecargaService,
    private userService: UserService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.returnUrl = history.state?.returnUrl || '/recargas/admin';

    this.ciudadanoId = Number(this.activatedRoute.snapshot.params['ciudadanoId']);
    this.cargarRecargas();
  }

  cargarRecargas(): void {
    this.recargaService.findByCiudadano(this.ciudadanoId).subscribe({
      next: (data) => {
        this.recargas = data;
        this.cargarNombreCiudadano();
      },
      error: (error) => {
        console.error('Error cargando historial de recargas:', error);

        Swal.fire(
          'Error',
          error.error?.message || 'No se pudo cargar el historial de recargas.',
          'error'
        );
      }
    });
  }

  cargarNombreCiudadano(): void {
    if (this.recargas.length === 0) {
      this.nombreCiudadano = `Ciudadano #${this.ciudadanoId}`;
      return;
    }

    const usuarioId = (this.recargas[0] as any)?.metodoPagoCiudadano?.ciudadano?.usuarioId;

    if (!usuarioId) {
      this.nombreCiudadano = `Ciudadano #${this.ciudadanoId}`;
      return;
    }

    this.userService.view(usuarioId).subscribe({
      next: (usuario: any) => {
        this.nombreCiudadano =
          usuario?.name ||
          usuario?.username ||
          usuario?.email ||
          usuarioId;
      },
      error: () => {
        this.nombreCiudadano = usuarioId;
      }
    });
  }

  view(id: number | undefined): void {
    if (!id) return;

    this.router.navigate(['/recargas/view', id]);
  }

  back(): void {
    this.router.navigateByUrl(this.returnUrl);
  }
}
