import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BusIncidentesComponent } from './bus-incidentes/bus-incidentes.component';

const routes: Routes = [
  {
    path: 'bus/:busId',
    component: BusIncidentesComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IncidentesRoutingModule {}
