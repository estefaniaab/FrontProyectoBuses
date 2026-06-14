import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SeguimientoBusComponent } from './seguimiento-bus/seguimiento-bus.component';

const routes: Routes = [
  {
    path: 'seguimiento',
    component: SeguimientoBusComponent
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MonitoreoRoutingModule { }
