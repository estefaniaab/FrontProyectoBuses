import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Profile } from 'src/app/models/Profiles/profile.model';
import { ProfileService } from 'src/app/services/Profile/profile.service';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']

})
export class ListComponent implements OnInit {
  profiles: Profile[] = [];

  constructor(
    private profilesService:ProfileService,

              private router:Router
  ) { }

  ngOnInit(): void {

    this.list();
  }

  list(){
    this.profilesService.list().subscribe({
      next: (profiles) => {
        this.profiles = profiles;
      }
    });
  }
  create(){
    this.router.navigate(['/profiles/create']);
  }
  view(id:string){
    this.router.navigate(['/profiles/view/'+id]);
  }
  edit(id:string){
    this.router.navigate(['/profiles/update/'+id]);
  }
  delete(id:string){
    console.log("Delete profile with id:", id);
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
        this.profilesService.delete(id).
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

  getUserName(user: any): string {
    return user ? user.name : 'Sin usuario';
  }

}
