import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListComponent } from './list/list.component';
import { ManageComponent } from './manage/manage.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CiudadanoRoutingModule } from './ciudadano-routing.module';


@NgModule({
  declarations: [
      ListComponent,
      ManageComponent
    ],
  imports: [
      CommonModule,
      CiudadanoRoutingModule,
      FormsModule,
      ReactiveFormsModule
   ]
})
export class CiudadanoModule { }
