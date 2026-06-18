import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { CitasService } from 'src/app/services/Citas/citas.service';
import { Cita } from 'src/app/models/Citas/cita.model';
import { TipoAtencion } from 'src/app/models/Citas/tipo-atencion.enum';
import { TipoConsulta } from 'src/app/models/Citas/tipo-consulta.enum';

@Component({
  selector: 'app-agendar',
  templateUrl: './agendar.component.html',
  styleUrls: ['./agendar.component.scss']
})
export class AgendarComponent implements OnInit {

  pestana: 'nueva' | 'mis-citas' = 'nueva';

  formGroup!: FormGroup;
  horarios: any[] = [];
  horariosAgrupados: any[] = [];
  horariosDelDia: any[] = [];

  fechaSeleccionada = '';
  cargando = false;

  tipoAtencionEnum = TipoAtencion;
  tipoConsultaEnum = TipoConsulta;

  constructor(
    private fb: FormBuilder,
    private service: CitasService
  ) {}

  ngOnInit(): void {
    this.formBuilder();
  }

  formBuilder() {

    this.formGroup = this.fb.group({

      tipoAtencion: [
        TipoAtencion.PRESENCIAL,
        Validators.required
      ],

      tipoConsulta: [
        '',
        Validators.required
      ],

      fechaHora: [
        '',
        Validators.required
      ],

      motivo: [
        '',
        Validators.required
      ]

    });

  }

  consultarDisponibilidad() {

    const cita: Cita = {
      tipoAtencion: this.formGroup.value.tipoAtencion
    };

    this.cargando = true;

    this.service
      .getDisponibilidad(cita)
      .subscribe({

        next: (data) => {

          console.log(data);

          this.horarios = data;

          this.agruparHorarios();

          this.cargando = false;

        },

        error: (err) => {

          console.error(err);

          this.cargando = false;

        }

      });

  }

  agruparHorarios() {

    const grupos: any = {};

    this.horarios.forEach((horario: any) => {

      const fecha =
        horario.fecha.split('T')[0];

      if (!grupos[fecha]) {
        grupos[fecha] = [];
      }

      grupos[fecha].push(horario);

    });

    this.horariosAgrupados =
      Object.keys(grupos).map(fecha => ({
        fecha,
        horarios: grupos[fecha]
      }));

  }

  cambiarFecha() {

    const grupo =
      this.horariosAgrupados.find(
        x => x.fecha === this.fechaSeleccionada
      );

    this.horariosDelDia =
      grupo?.horarios || [];

  }

  seleccionarHorario(fecha: string) {

    this.formGroup.patchValue({
      fechaHora: fecha
    });

  }

  agendar() {
      if (this.formGroup.invalid) {
        this.formGroup.markAllAsTouched();
        return;
      }

      const cita: Cita = { ...this.formGroup.value };

      this.service.agendar(cita).subscribe({
        next: (data) => {
          console.log(data);
          Swal.fire({
            icon: 'success',
            title: '¡Cita agendada!',
            text: 'Tu solicitud se ha registrado correctamente.',
            confirmButtonColor: '#2dce89',
            confirmButtonText: 'Aceptar'
          }).then(() => {
            this.pestana = 'mis-citas';
          });

          this.formGroup.reset();
          this.horarios = [];
          this.horariosAgrupados = [];
          this.horariosDelDia = [];
          this.fechaSeleccionada = '';
        },
        error: (err) => {
          console.error(err);
          // 🟢 Alerta de error estilizada
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un problema al agendar tu cita.',
            confirmButtonColor: '#f5365c'
          });
        }
      });
    }

}
