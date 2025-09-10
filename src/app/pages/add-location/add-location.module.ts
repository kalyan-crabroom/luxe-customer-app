import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddLocationPageRoutingModule } from './add-location-routing.module';

import { AddLocationPage } from './add-location.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddLocationPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [AddLocationPage]
})
export class AddLocationPageModule {}
