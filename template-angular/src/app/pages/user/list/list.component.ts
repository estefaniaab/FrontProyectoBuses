import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/models/Users/user.model';
import { UserService } from 'src/app/services/User/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  users: User[] = [];
  constructor(
    private usersService:UserService,
    private router:Router
  ) { }

  ngOnInit(): void {
    this.list();
  }

  list(){
    this.usersService.list().subscribe({
      next: (users) => {
        this.users = users;
      }
    });
  }
  create(){
    this.router.navigate(['/users/create']);
  }
  view(id:string){
    this.router.navigate(['/users/view/'+id]);
  }
  edit(id:string){
    this.router.navigate(['/users/update/'+id]);
  }
  delete(id:string){
    console.log("Delete user with id:", id);
    Swal.fire({
      title: 'Eliminar',
      text: "Está seguro que quiere eliminar el registro?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.usersService.delete(id).
        subscribe(data => {
          Swal.fire(
            'Eliminado!',
            'Registro eliminado correctamente.',
            'success'
          )
          this.ngOnInit();
        });
      }
    })
  }

 manageRoles(userId: string): void {
   this.router.navigate(['/user-role/update', userId], {
     queryParams: { returnTo: 'users-list' }
   });
 }
}
