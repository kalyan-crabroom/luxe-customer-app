import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TreatmentModalPageRoutingModule } from './treatment-modal-routing.module';

import { TreatmentModalPage } from './treatment-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TreatmentModalPageRoutingModule,ReactiveFormsModule
  ],
  declarations: [TreatmentModalPage]
})
export class TreatmentModalPageModule {}
