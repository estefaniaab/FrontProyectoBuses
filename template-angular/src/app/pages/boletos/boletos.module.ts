import { NgModule }             from '@angular/core';
import { CommonModule }         from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule }            from '@ng-bootstrap/ng-bootstrap';

import { BoletosRoutingModule } from './boletos-routing.module';
import { ListComponent }        from './list/list.component';
import { AbordajeComponent }    from './abordar/abordar.component';
import { DescensoComponent }    from './descender/descender.component';

@NgModule({
  declarations: [ListComponent, AbordajeComponent, DescensoComponent],
  imports: [
    CommonModule,
    BoletosRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
  ],
})
export class BoletosModule {}
