import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BackgroundCheckPageRoutingModule } from './background-check-routing.module';

import { BackgroundCheckPage } from './background-check.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BackgroundCheckPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [BackgroundCheckPage]
})
export class BackgroundCheckPageModule {}
