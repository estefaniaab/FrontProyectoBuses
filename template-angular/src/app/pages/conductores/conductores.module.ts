import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ConductoresRoutingModule } from './conductores-routing.module';
import { ListComponent } from './list/list.component';
import { ManageComponent } from './manage/manage.component'; // Importación necesaria

@NgModule({
  declarations: [
    ListComponent,
    ManageComponent
  ],
  imports: [
    CommonModule,
    ConductoresRoutingModule,
    ReactiveFormsModule
  ]
})
export class ConductoresModule { }
