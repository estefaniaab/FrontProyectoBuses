import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { PermissionsRoutingModule } from './permissions-routing.module';
import { PermissionListComponent } from './list/permission-list.component';
import { PermissionManageComponent } from './manage/permission-manage.component';

@NgModule({
  declarations: [
    PermissionListComponent,
    PermissionManageComponent
  ],
  imports: [
    CommonModule,
    PermissionsRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class PermissionsModule {}
