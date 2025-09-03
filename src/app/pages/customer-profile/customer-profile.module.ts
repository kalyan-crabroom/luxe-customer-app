import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CustomerProfilePageRoutingModule } from './customer-profile-routing.module';

import { CustomerProfilePage } from './customer-profile.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CustomerProfilePageRoutingModule
  ],
  declarations: [CustomerProfilePage]
})
export class CustomerProfilePageModule {}
