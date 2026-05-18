import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManageComponent } from './manage/manage.component';
import { AdminListComponent } from './admin-list/admin-list.component';
import { AdminDetalleComponent } from './admin-detalle/admin-detalle.component';


const routes: Routes = [
  { path: 'admin', component: AdminListComponent },
  { path: 'admin/ciudadano/:ciudadanoId', component: AdminDetalleComponent },
  {path: 'create', component:ManageComponent},
  {path: 'view/:id', component:ManageComponent},
  {path: 'update/:id', component:ManageComponent}
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RecargaRoutingModule { }
