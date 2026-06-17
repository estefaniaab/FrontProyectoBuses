import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MensajesRoutingModule } from './mensajes-routing.module';
import { BandejaComponent } from './bandeja/bandeja.component';
import { ChatComponent } from './chat/chat.component';

@NgModule({
  declarations: [BandejaComponent, ChatComponent],
  imports: [
    CommonModule,
    FormsModule,
    MensajesRoutingModule,
  ],
})
export class MensajesModule {}
