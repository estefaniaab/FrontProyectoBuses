import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent }   from './dashboard/dashboard.component';

import { RangosEtariosComponent } from './rangos-etarios/rangos-etarios.component';

const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: '',          redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'rangos-etarios',
    component: RangosEtariosComponent
  },
  {
    path: '',
    redirectTo: 'rangos-etarios',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class ReportesRoutingModule { }
