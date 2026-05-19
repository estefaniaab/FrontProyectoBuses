import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportesRoutingModule } from './reportes-routing.module';
import { DashboardComponent }   from './dashboard/dashboard.component';
import { RangosEtariosComponent } from './rangos-etarios/rangos-etarios.component';
import { TendenciaIncidentesComponent } from './tendencia-incidentes/tendencia-incidentes.component';

@NgModule({
  declarations: [
    RangosEtariosComponent,
    DashboardComponent,
    TendenciaIncidentesComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReportesRoutingModule
  ]
})
export class ReportesModule {}
