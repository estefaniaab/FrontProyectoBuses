// dashboard-buses-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardBusesComponent } from './dashboard-buses/dashboard-buses.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardBusesComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardBusesRoutingModule { }
