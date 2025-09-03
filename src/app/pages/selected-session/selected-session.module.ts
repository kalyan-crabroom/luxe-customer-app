import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SelectedSessionPageRoutingModule } from './selected-session-routing.module';

import { SelectedSessionPage } from './selected-session.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SelectedSessionPageRoutingModule
  ],
  declarations: [SelectedSessionPage]
})
export class SelectedSessionPageModule {}
