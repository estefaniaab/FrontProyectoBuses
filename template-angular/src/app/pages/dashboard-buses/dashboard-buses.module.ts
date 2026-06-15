// dashboard-buses.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { DashboardBusesRoutingModule } from './dashboard-buses-routing.module';
import { DashboardBusesComponent } from './dashboard-buses/dashboard-buses.component';

@NgModule({
  declarations: [DashboardBusesComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    DashboardBusesRoutingModule
  ]
})
export class DashboardBusesModule { }
