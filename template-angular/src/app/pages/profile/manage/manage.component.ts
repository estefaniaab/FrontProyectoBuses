import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Profile } from 'src/app/models/Profiles/profile.model';
import { ProfileService } from 'src/app/services/Profile/profile.service';
import { User } from 'src/app/models/Users/user.model';
import { UserService } from 'src/app/services/User/user.service';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss']
})
export class ManageComponent implements OnInit {
  mode: number; // 1: view, 2: create, 3: update
  profile: Profile;
  users: User[] = [];
  theFormGroup: FormGroup; // Policía de formulario
  trySend: boolean;
  photoFile: File | null = null;
  photoPreview: string | null = null;
  constructor(private activatedRoute: ActivatedRoute,
              private profilesService: ProfileService,
              private userService: UserService,
              private router: Router,
              private theFormBuilder: FormBuilder //Definir las reglas
  ) {
    this.trySend = false;
    this.profile= { id: '', user: null, phone: '', photo: ''};
    this.configFormGroup()
  }

  ngOnInit(): void {
    this.loadUsers();
    const currentUrl = this.activatedRoute.snapshot.url.join('/');
    if (currentUrl.includes('view')) {
      this.mode = 1;
    } else if (currentUrl.includes('create')) {
      this.mode = 2;
    } else if (currentUrl.includes('update')) {
      this.mode = 3;
    }
    if (this.mode === 1) {
      this.theFormGroup.disable();
    }
    if (this.activatedRoute.snapshot.params.id) {
      this.profile.id = this.activatedRoute.snapshot.params.id
      this.getProfile(this.profile.id)
    }

  }

  loadUsers() {
    this.userService.list().subscribe({
      next: (users) => { this.users = users; },
      error: (err) => { this.users = []; }
    });
  }

  onFileSelected(event: any): void {
     const file = event.target.files[0];
     if (file) {
       const reader = new FileReader();
       reader.onload = () => {
         const base64 = reader.result as string;
         this.photoPreview = base64;

         // ✅ Guarda el base64 directamente en el formulario
         this.theFormGroup.get('photo')?.setValue(base64);
         this.theFormGroup.get('photo')?.updateValueAndValidity();
       };
       reader.readAsDataURL(file); // convierte a base64
     }
   }
  configFormGroup() {
    this.theFormGroup = this.theFormBuilder.group({
      // primer elemento del vector, valor por defecto
      // lista, serán las reglas
      id: ['',[]],
      user: [null, [Validators.required]],
      phone: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10),Validators.pattern(/^3\d{9}$/)]],
      photo: ['', [Validators.required]]
    })
  }


  get getTheFormGroup() {
    return this.theFormGroup.controls
  }

  getProfile(id: string) {
    this.profilesService.view(id).subscribe({
      next: (response) => {
        this.profile= response;

        this.theFormGroup.patchValue({
          id: this.profile.id,
          user: this.profile.user?.id,
          phone: this.profile.phone,
          photo: this.profile.photo,
        });
      // Cargar preview de la foto guardada
         if (this.profile.photo) {
           this.photoPreview = this.profile.photo;
         }


        console.log('Profilefetched successfully:', this.profile);
      },
      error: (error) => {
        console.error('Error fetching profile:', error);
      }
    });
  }
  back() {
    this.router.navigate(['/profiles/list']);
  }

  create() {
    this.trySend = true;
    if (this.theFormGroup.invalid) {
      Swal.fire({
        title: 'Error!',
        text: 'Por favor, complete todos los campos requeridos.',
        icon: 'error',
      })
      return;
    }
    const formValue = this.theFormGroup.value;
    const profileToSend = {
      phone: formValue.phone,
      photo: formValue.photo,
      user: { id: formValue.user }
    };
    this.profilesService.create(profileToSend).subscribe({
      next: (profile) => {
        console.log('Profile created successfully:', profile);
        Swal.fire({
          title: 'Creado!',
          text: 'Registro creado correctamente.',
          icon: 'success',
        })
        this.router.navigate(['/profiles/list']);
      },
      error: (error) => {
        console.error('Error creating profile:', error);
      }
    });
  }
  update() {
    this.trySend = true;
    if (this.theFormGroup.invalid) {
      Swal.fire({
        title: 'Error!',
        text: 'Por favor, complete todos los campos requeridos.',
        icon: 'error',
      })
      return;
    }
    const formValue = this.theFormGroup.value;
    const profileToSend = {
      phone: formValue.phone,
      photo: formValue.photo,
      user: { id: formValue.user }
    };
    this.profilesService.update(this.profile.id, profileToSend).subscribe({
      next: (profile) => {
        console.log('Profile updated successfully:', profile);
        Swal.fire({
          title: 'Actualizado!',
          text: 'Registro actualizado correctamente.',
          icon: 'success',
        })
        this.router.navigate(['/profiles/list']);
      },
      error: (error) => {
        console.error('Error updating profile:', error);
      }
    });
  }
  unlinkGithub() {
    Swal.fire({
      title: '¿Desvincular GitHub?',
      text: '¿Está seguro que desea desvincular su cuenta de GitHub?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, desvincular',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.unlinkGithub(this.profile.user.id).subscribe({
          next: () => {
            Swal.fire('Desvinculado', 'Cuenta GitHub desvinculada correctamente.', 'success');
            this.profile.user.githubUsername = null;
          },
          error: (err) => console.error(err)
        });
      }
    });
  }

}
