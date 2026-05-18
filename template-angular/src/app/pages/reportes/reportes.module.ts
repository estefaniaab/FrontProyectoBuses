import { NgModule }             from '@angular/core';
import { CommonModule }         from '@angular/common';
import { FormsModule }          from '@angular/forms';
import { ReportesRoutingModule } from './reportes-routing.module';
import { DashboardComponent }   from './dashboard/dashboard.component';

@NgModule({
  declarations: [DashboardComponent],
  imports: [CommonModule, ReportesRoutingModule, FormsModule],
})
export class ReportesModule {}
