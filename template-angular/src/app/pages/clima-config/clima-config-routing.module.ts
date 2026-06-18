import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClimaConfigComponent } from './clima-config/clima-config.component';

const routes: Routes = [
  { path: '', component: ClimaConfigComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClimaConfigRoutingModule { }
