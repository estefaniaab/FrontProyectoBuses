import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HistorialRoutingModule } from './historial-routing.module';
import { RecorridoComponent } from './recorrido/recorrido.component';
import { ListComponent } from './list/list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps';


@NgModule({
  declarations: [
    RecorridoComponent,
    ListComponent
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
