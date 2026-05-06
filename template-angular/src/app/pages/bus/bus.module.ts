import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListComponent } from './list/list.component';
import { ManageComponent } from './manage/manage.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BusRoutingModule } from './bus-routing.module';
import { QRCodeModule } from 'angularx-qrcode';

@NgModule({
  declarations: [
    ListComponent,
    ManageComponent],
  imports: [
    CommonModule,
    BusRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    QRCodeModule
  ]
})
export class BusModule { }
