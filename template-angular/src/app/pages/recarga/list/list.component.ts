import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Recarga } from 'src/app/models/Recargas/recarga.model';
import { RecargaService } from 'src/app/services/Recarga/recarga.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list-recargas',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {

  recargas: Recarga[] = [];
  focus = false;

  constructor(
    private recargaService: RecargaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.list();
  }

  list(): void {
    this.recargaService.list().subscribe({
      next: (recargas) => {
        this.recargas = recargas;
      },
      error: (error) => {
        console.error('Error listando recargas:', error);
      }
    });
  }
  create(): void {
    this.router.navigate(['/recargas/create']);
  }

  view(id: number): void {
    this.router.navigate(['/recargas/view/' + id]);
  }

}
