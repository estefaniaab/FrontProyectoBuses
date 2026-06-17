import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AgendarComponent } from './agendar/agendar.component';

const routes: Routes = [
  {
    path: 'agendar',
    component: AgendarComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class CitasRoutingModule {}
