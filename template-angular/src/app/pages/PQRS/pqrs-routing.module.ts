import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DetallePqrsComponent } from './detalle-pqrs/detalle-pqrs.component';
import { CrearPqrsComponent } from './crear-pqrs/crear-pqrs.component';

const routes: Routes = [
   { path: '', component: CrearPqrsComponent,},
   { path: ':radicado', component: DetallePqrsComponent, },
 ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PQRSRoutingModule { }
