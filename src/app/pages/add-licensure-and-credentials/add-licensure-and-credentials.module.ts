import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddLicensureAndCredentialsPageRoutingModule } from './add-licensure-and-credentials-routing.module';

import { AddLicensureAndCredentialsPage } from './add-licensure-and-credentials.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddLicensureAndCredentialsPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [AddLicensureAndCredentialsPage]
})
export class AddLicensureAndCredentialsPageModule {}
