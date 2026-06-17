import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BandejaComponent } from './bandeja/bandeja.component';
import { ChatComponent } from './chat/chat.component';

const routes: Routes = [
  { path: '', component: BandejaComponent },
  { path: 'chat/:userId', component: ChatComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MensajesRoutingModule {}
