import { Component, OnInit }             from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router }         from '@angular/router';
import { BoletosService }                from 'src/app/services/Boletos/boletos.service';
import { Boleto, ParaderoBasic }         from 'src/app/models/Boletos/boleto.model';
import Swal                              from 'sweetalert2';

@Component({
  selector:    'app-descender',
  templateUrl: './descender.component.html',
  styleUrls:   ['./descender.component.scss'],
})
export class DescensoComponent implements OnInit {
  form!:     FormGroup;
  id?:       number;
  boleto?:   Boleto;
  paraderos: ParaderoBasic[] = [];

  constructor(
    private fb:      FormBuilder,
    private service: BoletosService,
    private router:  Router,
    private route:   ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      paraderoDescensoId: [null, [Validators.required]],
    });

    const rawId = this.route.snapshot.params['id'];
    this.id = rawId ? +rawId : undefined;

    if (this.id) this.cargarBoleto();
    this.cargarParaderos();
  }

  cargarBoleto(): void {
    this.service.findOne(this.id!).subscribe({
      next:  (data) => (this.boleto = data),
      error: (err)  => console.error('Error al cargar boleto', err),
    });
  }

  cargarParaderos(): void {
    this.service.getParaderos().subscribe({
      next:  (data) => (this.paraderos = data),
      error: (err)  => console.error('Error al obtener paraderos', err),
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      Swal.fire('Atención', 'Selecciona el paradero donde bajas.', 'warning');
      return;
    }

    const dto = { paraderoDescensoId: Number(this.form.get('paraderoDescensoId')?.value) };

    this.service.descender(this.id!, dto).subscribe({
      next: (res) =>
        Swal.fire({
          title: '¡Viaje completado!',
          text:  res.mensaje,
          icon:  'success',
          confirmButtonText: 'Ver mis boletos',
        }).then(() => this.router.navigate(['/boletos/list'])),
      error: (err) =>
        Swal.fire('Error', err.error?.message || 'No se pudo registrar el descenso.', 'error'),
    });
  }
}
