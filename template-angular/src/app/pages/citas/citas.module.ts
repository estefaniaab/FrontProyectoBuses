import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReactiveFormsModule }from '@angular/forms';

import { CitasRoutingModule }from './citas-routing.module';
import { AgendarComponent }from './agendar/agendar.component';
import { FormsModule } from '@angular/forms';

@NgModule({

  declarations: [
    AgendarComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CitasRoutingModule
  ]
})
export class CitasModule {}
