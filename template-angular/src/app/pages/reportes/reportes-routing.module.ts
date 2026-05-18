import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RangosEtariosComponent } from './rangos-etarios/rangos-etarios.component';

const routes: Routes = [
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
  exports: [RouterModule]
})
export class ReportesRoutingModule { }
