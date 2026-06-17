import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { ListComponent }    from './list/list.component';
import { ManageComponent }  from './manage/manage.component';
import { CreateComponent }  from './create/create.component';
import { ChatComponent }    from './chat/chat.component';
import { BandejaComponent } from './bandeja/bandeja.component';
import { AlertaComponent }  from './alerta/alerta.component';

const routes: Routes = [
  { path: 'list',        component: ListComponent },
  { path: 'create',      component: CreateComponent },
  { path: 'update/:id',  component: CreateComponent },
  { path: 'manage/:id',  component: ManageComponent },
  { path: 'chat/:id',    component: ChatComponent },
  { path: 'bandeja',     component: BandejaComponent },
  { path: 'alertas',     component: AlertaComponent },
  { path: '',            redirectTo: 'list', pathMatch: 'full' },
];

@NgModule({
  declarations: [
    ListComponent,
    ManageComponent,
    CreateComponent,
    ChatComponent,
    BandejaComponent,
    AlertaComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forChild(routes),
  ],
})
export class GruposModule {}
