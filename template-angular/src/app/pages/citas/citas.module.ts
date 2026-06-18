import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReactiveFormsModule }from '@angular/forms';

import { CitasRoutingModule }from './citas-routing.module';
import { AgendarComponent }from './agendar/agendar.component';
import { FormsModule } from '@angular/forms';
import { ListComponent } from './list/list.component';

@NgModule({

  declarations: [
    AgendarComponent,
    ListComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CitasRoutingModule
  ]
})
export class CitasModule {}
