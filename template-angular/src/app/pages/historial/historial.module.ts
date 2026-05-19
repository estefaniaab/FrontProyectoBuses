import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HistorialRoutingModule } from './historial-routing.module';
import { RecorridoComponent } from './recorrido/recorrido.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps';
import { AdminListComponent } from './admin-list/admin-list.component';
import { AdminDetalleComponent } from './admin-detalle/admin-detalle.component';


@NgModule({
  declarations: [
    RecorridoComponent,
    AdminListComponent,
    AdminDetalleComponent
  ],
  imports: [
    CommonModule,
    HistorialRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    GoogleMapsModule
  ]
})
export class HistorialModule { }
