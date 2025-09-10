import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GuestDetails2PageRoutingModule } from './guest-details2-routing.module';

import { GuestDetails2Page } from './guest-details2.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GuestDetails2PageRoutingModule,ReactiveFormsModule
  ],
  declarations: [GuestDetails2Page]
})
export class GuestDetails2PageModule {}
