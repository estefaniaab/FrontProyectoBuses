import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DetallePqrsComponent } from './detalle-pqrs/detalle-pqrs.component';
import { CrearPqrsComponent } from './crear-pqrs/crear-pqrs.component';
import { AdminDetallePqrsComponent } from './admin-detalle-pqrs/admin-detalle-pqrs.component';
import { AdminListPqrsComponent } from './admin-list-pqrs/admin-list-pqrs.component'
import { ConsultarPqrsComponent } from './consultar-pqrs/consultar-pqrs.component'

const routes: Routes = [
   { path: '', component: CrearPqrsComponent,},
   { path: 'consultar', component: ConsultarPqrsComponent },
   { path: 'admin', component: AdminListPqrsComponent },
   { path: 'admin/usuario/:usuarioId', component: AdminDetallePqrsComponent },
   { path: ':radicado', component: DetallePqrsComponent, },
   { path: 'admin/ver/:radicado', component: DetallePqrsComponent },
   { path: 'admin/editar/:radicado', component: DetallePqrsComponent }
 ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PQRSRoutingModule { }
