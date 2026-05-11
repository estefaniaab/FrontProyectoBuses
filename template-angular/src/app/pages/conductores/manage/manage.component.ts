import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConductoresService } from "src/app/services/Conductores/conductores.service";
import { User } from 'src/app/models/Users/user.model';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss']
})
export class ManageComponent implements OnInit {
  form: FormGroup;
  id?: number;
  isEdit = false;
  isView = false;
  users: User[] = [];

  constructor(
    private fb: FormBuilder,
    private service: ConductoresService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      // El userId ahora recibe el string alfanumérico largo sin problemas
      userId: [null, [Validators.required]],
      // Licencia ajustada para que funcione como número de identificación (cédula)
      licencia: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(20)
      ]],
      fechaVencimientoLicencia: [null],
      telefono: ['', [Validators.maxLength(20)]],
      activo: [true]
    });
  }

  ngOnInit(): void {
    const url = this.route.snapshot.url.join('/');
    this.id = this.route.snapshot.params['id'];

    this.getUsers();

    if (this.id) {
      if (url.includes('view')) {
        this.isView = true;
        this.form.disable();
      } else if (url.includes('update')) {
        this.isEdit = true;
      }
      this.loadDriver();
    }
  }

  getUsers() {
    this.service.getUsers().subscribe({
      next: (data) => {
        this.users = data;
      },
      error: (err) => {
        console.error("Error al cargar usuarios de seguridad", err);
      }
    });
  }

  loadDriver() {
    this.service.view(this.id!).subscribe({
      next: (data) => {
        if (data.fechaVencimientoLicencia) {
          data.fechaVencimientoLicencia = new Date(data.fechaVencimientoLicencia)
            .toISOString().substring(0, 10);
        }
        this.form.patchValue(data);
      }
    });
  }

  /**
   * Envía la información al backend respetando los strings alfanuméricos
   */
  save() {
    if (this.form.invalid) return;

    // Obtenemos los valores tal cual están en el formulario
    const data = this.form.getRawValue();

    // IMPORTANTE: No usamos parseInt() ni Number()
    // Dejamos que el userId y la licencia viajen como cadenas de texto

    const request = this.isEdit
      ? this.service.update({ ...data, id: this.id })
      : this.service.create(data);

    request.subscribe({
      next: () => {
        this.router.navigate(['/conductores/list']);
      },
      error: (err) => {
        // Capturamos el mensaje de error del backend (ej: "Ya existe un perfil...")
        const message = err.error?.message || 'Error al guardar el conductor';
        alert(Array.isArray(message) ? message.join(', ') : message);
      }
    });
  }
}
