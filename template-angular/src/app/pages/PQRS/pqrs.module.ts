import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { PQRSRoutingModule } from './pqrs-routing.module';
import { CrearPqrsComponent } from './crear-pqrs/crear-pqrs.component';
import { DetallePqrsComponent } from './detalle-pqrs/detalle-pqrs.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    CrearPqrsComponent,
    DetallePqrsComponent,
    ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    PQRSRoutingModule,
    RouterModule,
  ]
})
export class PQRSModule { }
