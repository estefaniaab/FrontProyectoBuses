import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { PQRSRoutingModule } from './pqrs-routing.module';
import { CrearPqrsComponent } from './crear-pqrs/crear-pqrs.component';
import { RouterModule } from '@angular/router';
import { DetallePqrsComponent } from './detalle-pqrs/detalle-pqrs.component';
import { AdminDetallePqrsComponent } from './admin-detalle-pqrs/admin-detalle-pqrs.component';
import { AdminListPqrsComponent } from './admin-list-pqrs/admin-list-pqrs.component';
import { ConsultarPqrsComponent } from './consultar-pqrs/consultar-pqrs.component'

@NgModule({
  declarations: [
    CrearPqrsComponent,
    DetallePqrsComponent,
    AdminDetallePqrsComponent,
    AdminListPqrsComponent,
    ConsultarPqrsComponent
    ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    PQRSRoutingModule,
    RouterModule,
    FormsModule
  ]
})
export class PQRSModule { }
