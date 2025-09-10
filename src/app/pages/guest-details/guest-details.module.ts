import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GuestDetailsPageRoutingModule } from './guest-details-routing.module';

import { GuestDetailsPage } from './guest-details.page';
import { ShareModule } from 'src/app/share/share.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GuestDetailsPageRoutingModule,ReactiveFormsModule,
    ShareModule
  ],
  declarations: [GuestDetailsPage]
})
export class GuestDetailsPageModule {}
