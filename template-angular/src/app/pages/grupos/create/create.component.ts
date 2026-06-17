import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { GrupoService } from 'src/app/services/Grupo/grupo.service';
import { environment } from 'src/environments/environment';

interface Usuario {
  id: string;
  name: string;
  email: string;
}

@Component({
  selector: 'app-create-grupo',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
})
export class CreateComponent implements OnInit {
  mode!: number;
  theFormGroup!: FormGroup;
  trySend = false;
  fotoPreview: string | null = null;

  // HU-ENTR-3-006: usuarios disponibles y seleccionados
  usuarios: Usuario[] = [];
  usuariosSeleccionados: Usuario[] = [];
  busquedaUsuario = '';

  get usuarioActual(): string {
    const session = localStorage.getItem('session');
    return session ? JSON.parse(session)?.id ?? '' : '';
  }

  get token(): string {
    const session = localStorage.getItem('session');
    return session ? `Bearer ${JSON.parse(session)?.token ?? ''}` : '';
  }

  get usuariosFiltrados(): Usuario[] {
    const term = this.busquedaUsuario.toLowerCase();
    return this.usuarios.filter(
      u => u.id !== this.usuarioActual &&
           !this.usuariosSeleccionados.find(s => s.id === u.id) &&
           (u.name?.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term)),
    );
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private theFormBuilder: FormBuilder,
    private grupoService: GrupoService,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    this.configFormGroup();

    const currentUrl = this.activatedRoute.snapshot.url.join('/');
    if (currentUrl.includes('create')) this.mode = 2;
    else if (currentUrl.includes('update')) this.mode = 3;

    if (this.activatedRoute.snapshot.params['id']) {
      this.cargarGrupo(Number(this.activatedRoute.snapshot.params['id']));
    }

    if (this.mode === 2) this.cargarUsuarios();
  }

  configFormGroup(): void {
    this.theFormGroup = this.theFormBuilder.group({
      id:          [null],
      nombre:      ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      descripcion: ['', [Validators.maxLength(500)]],
      esPublico:   [true, [Validators.required]],
      fotoUrl:     [''],
    });
  }

  get f() { return this.theFormGroup.controls; }

  cargarUsuarios(): void {
    this.http.get<Usuario[]>(`${environment.url_ms_security}/users`, {
      headers: { Authorization: this.token },
    }).subscribe({
      next: users => (this.usuarios = users),
      error: () => console.error('Error cargando usuarios'),
    });
  }

  cargarGrupo(id: number): void {
    this.grupoService.view(id).subscribe({
      next: grupo => {
        this.theFormGroup.patchValue({
          id:          grupo.id,
          nombre:      grupo.nombre,
          descripcion: grupo.descripcion,
          esPublico:   grupo.esPublico,
          fotoUrl:     grupo.fotoUrl,
        });
        if (grupo.fotoUrl) this.fotoPreview = grupo.fotoUrl;
      },
    });
  }

  onFotoSeleccionada(event: any): void {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      Swal.fire('Imagen muy grande', 'La imagen no debe superar los 2 MB.', 'warning');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      this.fotoPreview = base64;
      this.theFormGroup.get('fotoUrl')?.setValue(base64);
    };
    reader.readAsDataURL(file);
  }

  agregarMiembro(usuario: Usuario): void {
    this.usuariosSeleccionados.push(usuario);
    this.busquedaUsuario = '';
  }

  quitarMiembro(usuario: Usuario): void {
    this.usuariosSeleccionados = this.usuariosSeleccionados.filter(u => u.id !== usuario.id);
  }

  back(): void { this.router.navigate(['/grupos/list']); }

  create(): void {
    this.trySend = true;
    if (this.theFormGroup.invalid) {
      Swal.fire('Error', 'Por favor, complete todos los campos requeridos.', 'error');
      return;
    }

    if (this.mode === 2 && this.usuariosSeleccionados.length < 2) {
      Swal.fire('Atención', 'Debes agregar al menos 2 miembros además del creador.', 'warning');
      return;
    }

    const dto = {
      nombre:           this.theFormGroup.value.nombre,
      descripcion:      this.theFormGroup.value.descripcion,
      esPublico:        this.theFormGroup.value.esPublico,
      fotoUrl:          this.theFormGroup.value.fotoUrl,
      creadorUsuarioId: this.usuarioActual,
      miembrosIniciales: this.usuariosSeleccionados.map(u => u.id),
    };

    this.grupoService.create(dto).subscribe({
      next: () => {
        Swal.fire('Creado!', 'Grupo creado correctamente.', 'success');
        this.router.navigate(['/grupos/list']);
      },
      error: err => Swal.fire('Error', err.error?.message || 'No se pudo crear el grupo.', 'error'),
    });
  }

  update(): void {
    this.trySend = true;
    if (this.theFormGroup.invalid) {
      Swal.fire('Error', 'Por favor, complete todos los campos requeridos.', 'error');
      return;
    }

    const id = this.theFormGroup.value.id;
    this.grupoService.update(id, {
      nombre:      this.theFormGroup.value.nombre,
      descripcion: this.theFormGroup.value.descripcion,
      esPublico:   this.theFormGroup.value.esPublico,
      fotoUrl:     this.theFormGroup.value.fotoUrl,
    }).subscribe({
      next: () => {
        Swal.fire('Actualizado!', 'Grupo actualizado correctamente.', 'success');
        this.router.navigate(['/grupos/list']);
      },
      error: err => Swal.fire('Error', err.error?.message || 'No se pudo actualizar.', 'error'),
    });
  }
}
