import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TurnosRoutingModule } from './turnos-routing.module';
import { ListComponent } from './list/list.component';
import { ManageComponent } from './manage/manage.component';

// Si usas componentes de diseño como NgbModule (Bootstrap) añádelos aquí
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [
    ListComponent,
    ManageComponent
  ],
  imports: [
    CommonModule,
    TurnosRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule // Opcional, según tu proyecto base
  ]
})
export class TurnosModule { }
