import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditBackgroundCheckPageRoutingModule } from './edit-background-check-routing.module';

import { EditBackgroundCheckPage } from './edit-background-check.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditBackgroundCheckPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [EditBackgroundCheckPage]
})
export class EditBackgroundCheckPageModule {}
