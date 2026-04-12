import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionRoutingModule } from './session-routing.module';
import { ListComponent } from './list/list.component';
import { ManageComponent } from './manage/manage.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    ListComponent,
    ManageComponent
  ],
  imports: [
     CommonModule,
     SessionRoutingModule,
     FormsModule,
     RouterModule,
     ReactiveFormsModule
  ]
})
export class SessionsModule { }
