import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TherapistsProfilePageRoutingModule } from './therapists-profile-routing.module';

import { TherapistsProfilePage } from './therapists-profile.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TherapistsProfilePageRoutingModule
  ],
  declarations: [TherapistsProfilePage]
})
export class TherapistsProfilePageModule {}
