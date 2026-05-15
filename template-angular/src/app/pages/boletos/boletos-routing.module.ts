import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListComponent }     from './list/list.component';
import { AbordajeComponent } from './abordar/abordar.component';
import { DescensoComponent } from './descender/descender.component';

const routes: Routes = [
  { path: 'list',          component: ListComponent },
  { path: 'abordar',       component: AbordajeComponent },
  { path: 'descender/:id', component: DescensoComponent },
  { path: '',              redirectTo: 'list', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BoletosRoutingModule {}
