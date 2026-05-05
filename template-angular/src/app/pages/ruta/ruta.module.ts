// ─────────────────────────────────────────────────────────────────────────────
// src/app/pages/rutas/ruta.module.ts
// ─────────────────────────────────────────────────────────────────────────────

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { RutaRoutingModule } from './ruta-routing.module';

import { ListComponent } from './list/list.component';
import { ManageComponent } from './manage/manage.component';
import {
  GestionarParaderosModalComponent
} from "src/app/pages/gestionar-paraderos-modal/gestionar-paraderos-modal.component";


@NgModule({
  declarations: [
    ListComponent,
    ManageComponent,
    GestionarParaderosModalComponent,   // ← nuevo modal
  ],
  imports: [
    CommonModule,
    RutaRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    DragDropModule,                     // ← CDK Drag & Drop
  ],
})
export class RutaModule {}
