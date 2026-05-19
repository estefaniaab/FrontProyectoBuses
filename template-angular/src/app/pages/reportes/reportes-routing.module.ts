import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent }   from './dashboard/dashboard.component';

import { RangosEtariosComponent } from './rangos-etarios/rangos-etarios.component';
import { TendenciaIncidentesComponent } from './tendencia-incidentes/tendencia-incidentes.component';

const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  {path: 'rangos-etarios',component: RangosEtariosComponent},
  {path: 'tendencia-incidentes',component: TendenciaIncidentesComponent},
  { path: '',          redirectTo: 'dashboard', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class ReportesRoutingModule { }
