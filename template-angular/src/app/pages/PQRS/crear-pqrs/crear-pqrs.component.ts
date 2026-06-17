import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PqrsService } from 'src/app/services/PQRS/pqrs.service';

@Component({
  selector: 'app-crear-pqrs',
  templateUrl: './crear-pqrs.component.html',
})
export class CrearPqrsComponent implements OnInit {
  loading = false;
  respuesta: any = null;
  fotosBase64: string[] = []; // Almacena las fotos convertidas

  form = this.fb.group({
    tipo: ['', Validators.required],
    categoria: ['', Validators.required],
    descripcion: ['', [Validators.required, Validators.maxLength(500), Validators.minLength(10)]],
    email: ['', [Validators.required, Validators.email]], // Nuevo campo con validación de email
  });

  constructor(
    private fb: FormBuilder,
    private pqrsService: PqrsService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // Precargar email si existe sesión activa
    const session = JSON.parse(localStorage.getItem('session') || '{}');
    const emailUsuario = session.email || session.user?.email;

    if (emailUsuario) {
      this.form.patchValue({ email: emailUsuario });
    }
  }

  onFileChange(event: any) {
    const files: FileList = event.target.files;

    if (files.length > 3) {
      alert('Solo puedes adjuntar un máximo de 3 fotos.');
      event.target.value = ''; // Limpia el input
      this.fotosBase64 = [];
      return;
    }

    this.fotosBase64 = [];
    // Convertir las imágenes a Base64 para enviarlas en el JSON
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.fotosBase64.push(e.target.result);
      };
      reader.readAsDataURL(file);
    });
  }

  crearPQRS() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    const session = JSON.parse(localStorage.getItem('session') || '{}');
    const usuarioId = session.id || session.user?.id || session.user?._id;

    // Body completo incluyendo el email del formulario y el arreglo de fotos
    const body = {
      ...this.form.value,
      usuarioId,
      fotos: this.fotosBase64
    };

    console.log('📤 Enviando PQRS:', body);

    this.pqrsService.create(body as any).subscribe({
      next: (resp: any) => {
        console.log('✅ PQRS creado:', resp);
        this.loading = false;
        this.respuesta = resp;
        this.form.reset();
        this.fotosBase64 = [];
        this.router.navigate(['/pqrs', resp.radicado]);
      },
      error: (err) => {
        this.loading = false;
        console.error('❌ Error creando PQRS:', err);
        alert(err?.error?.message || 'Error creando PQRS');
      },
    });
  }
}
