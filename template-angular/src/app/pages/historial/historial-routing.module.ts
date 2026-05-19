import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RecorridoComponent } from './recorrido/recorrido.component';
import { AdminListComponent } from './admin-list/admin-list.component';
import { AdminDetalleComponent } from './admin-detalle/admin-detalle.component';


const routes: Routes = [
  { path: 'admin', component: AdminListComponent },
  { path: 'admin/ciudadano/:ciudadanoId', component: AdminDetalleComponent },
  { path: 'recorrido/:boletoId', component: RecorridoComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HistorialRoutingModule { }
