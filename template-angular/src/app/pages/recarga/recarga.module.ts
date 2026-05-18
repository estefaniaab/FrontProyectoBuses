import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecargaRoutingModule } from './recarga-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ManageComponent } from './manage/manage.component';
import { AdminListComponent } from './admin-list/admin-list.component';
import { AdminDetalleComponent } from './admin-detalle/admin-detalle.component';

@NgModule({
  declarations: [
    ManageComponent,
    AdminListComponent,
    AdminDetalleComponent],
  imports: [
    CommonModule,
    RecargaRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class RecargaModule {}
