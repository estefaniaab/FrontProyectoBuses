import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GpsRoutingModule } from './gps-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ManageComponent } from './manage/manage.component';

@NgModule({
  declarations: [
    ManageComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    GpsRoutingModule
  ]
})
export class GpsModule {}
