import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CorrectEmailPageRoutingModule } from './correct-email-routing.module';

import { CorrectEmailPage } from './correct-email.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CorrectEmailPageRoutingModule,ReactiveFormsModule
  ],
  declarations: [CorrectEmailPage]
})
export class CorrectEmailPageModule {}
