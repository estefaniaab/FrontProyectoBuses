import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { ProgramacionesRutaRoutingModule } from './programaciones-ruta-routing.module';
import { ListComponent } from './list/list.component';
import { ManageComponent } from './manage/manage.component';

@NgModule({
  declarations: [
    ListComponent,
    ManageComponent
  ],
  imports: [
    CommonModule,
    ProgramacionesRutaRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule
  ]
})
export class ProgramacionesRutaModule {}
