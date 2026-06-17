import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PqrsService } from 'src/app/services/PQRS/pqrs.service';
import { PQRS } from 'src/app/models/PQRS/pqrs.model';

@Component({
  selector: 'app-detalle-pqrs',
  templateUrl: './detalle-pqrs.component.html',
})
export class DetallePqrsComponent implements OnInit {
  pqrs?: PQRS;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private pqrsService: PqrsService,
  ) {}

  ngOnInit(): void {
    const radicado = this.route.snapshot.paramMap.get('radicado');

    if (radicado) {
      this.pqrsService.view(radicado).subscribe({
        next: (resp) => {
          this.pqrs = resp;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
    }
  }
}
