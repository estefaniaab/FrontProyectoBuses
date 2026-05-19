import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IncidentesRoutingModule } from './incidentes-routing.module';
import { BusIncidentesComponent } from './bus-incidentes/bus-incidentes.component';

@NgModule({
  declarations: [
    BusIncidentesComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    IncidentesRoutingModule
  ]
})
export class IncidentesModule {}
