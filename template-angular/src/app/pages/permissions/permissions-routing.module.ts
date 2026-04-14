import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionListComponent } from '../permissions/list/permission-list.component';
import { PermissionManageComponent } from '../permissions/manage/permission-manage.component';

const routes: Routes = [
  { path: 'list', component: PermissionListComponent },
  { path: 'create', component: PermissionManageComponent },
  { path: 'view/:id', component: PermissionManageComponent },
  { path: 'update/:id', component: PermissionManageComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PermissionsRoutingModule {}
