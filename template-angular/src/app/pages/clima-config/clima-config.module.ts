import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ClimaConfigRoutingModule } from './clima-config-routing.module';
import { ClimaConfigComponent } from './clima-config/clima-config.component';

@NgModule({
  declarations: [
    ClimaConfigComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ClimaConfigRoutingModule
  ]
})
export class ClimaConfigModule { }
