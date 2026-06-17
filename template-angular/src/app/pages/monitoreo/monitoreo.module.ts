import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MonitoreoRoutingModule } from './monitoreo-routing.module';

import { SeguimientoBusComponent } from './seguimiento-bus/seguimiento-bus.component';

@NgModule({
  declarations: [
    SeguimientoBusComponent
  ],
  imports: [
    CommonModule,
    MonitoreoRoutingModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class MonitoreoModule { }
