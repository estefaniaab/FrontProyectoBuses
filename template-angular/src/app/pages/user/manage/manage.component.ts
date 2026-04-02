import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { User } from '../../../models/Users/user.model';
import { UserService } from '../../../services/User/user.service';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss']
})
export class ManageComponent implements OnInit {
  mode: number; // 1: view, 2: create, 3: update
  user: User;
  theFormGroup: FormGroup; // Policía de formulario
  trySend: boolean;
  constructor(private activatedRoute: ActivatedRoute,
              private usersService: UserService,
              private router: Router,
              private theFormBuilder: FormBuilder //Definir las reglas
  ) {
    this.trySend = false;
    this.user = { id: '', name: '', email: '', password: ''};
    this.configFormGroup()
  }

  ngOnInit(): void {
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
      this.user.id = this.activatedRoute.snapshot.params.id
      this.getUser(this.user.id)
    }

  }
  configFormGroup() {
    this.theFormGroup = this.theFormBuilder.group({
      // primer elemento del vector, valor por defecto
      // lista, serán las reglas
      id: ['',[]],
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email, Validators.minLength(5), Validators.maxLength(100)]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]],
    })
  }


  get getTheFormGroup() {
    return this.theFormGroup.controls
  }

  getUser(id:string) {
    this.usersService.view(id).subscribe({
      next: (response) => {
        this.user = response;

        this.theFormGroup.patchValue({
          id: this.user.id,
          name: this.user.name,
          email: this.user.email,
          password: this.user.password,
        });

        console.log('user fetched successfully:', this.user);
      },
      error: (error) => {
        console.error('Error fetching user:', error);
      }
    });
  }
  back() {
    this.router.navigate(['/users/list']);
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
    this.usersService.create(this.theFormGroup.value).subscribe({
      next: (user) => {
        console.log('user created successfully:', user);
        Swal.fire({
          title: 'Creado!',
          text: 'Registro creado correctamente.',
          icon: 'success',
        })
        this.router.navigate(['/users/list']);
      },
      error: (error) => {
        console.error('Error creating user:', error);
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
    this.usersService.update(this.theFormGroup.value).subscribe({
      next: (user) => {
        console.log('user updated successfully:', user);
        Swal.fire({
          title: 'Actualizado!',
          text: 'Registro actualizado correctamente.',
          icon: 'success',
        })
        this.router.navigate(['/users/list']);
      },
      error: (error) => {
        console.error('Error updating user:', error);
      }
    });
  }

}
