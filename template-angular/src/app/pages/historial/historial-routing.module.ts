import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListComponent } from './list/list.component';
import { RecorridoComponent } from './recorrido/recorrido.component';


const routes: Routes = [
  {path: 'list', component:ListComponent},
  { path: 'recorrido/:boletoId', component: RecorridoComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HistorialRoutingModule { }
