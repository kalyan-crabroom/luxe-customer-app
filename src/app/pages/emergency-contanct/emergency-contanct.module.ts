import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EmergencyContanctPageRoutingModule } from './emergency-contanct-routing.module';

import { EmergencyContanctPage } from './emergency-contanct.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EmergencyContanctPageRoutingModule
  ],
  declarations: [EmergencyContanctPage]
})
export class EmergencyContanctPageModule {}
