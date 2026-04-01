
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UsersRolesRoutingModule } from './usersRoles-routing.module';
import { ManageComponent } from './manage/manage.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    ManageComponent
  ],
  imports: [
    CommonModule,
    UsersRolesRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class UsersRolesModule { }
