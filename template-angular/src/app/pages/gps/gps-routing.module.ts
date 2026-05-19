import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ManageComponent } from './manage/manage.component';

const routes: Routes = [
  { path: 'bus/:busId', component: ManageComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GpsRoutingModule {}
