import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CancelSessionPageRoutingModule } from './cancel-session-routing.module';

import { CancelSessionPage } from './cancel-session.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CancelSessionPageRoutingModule,ReactiveFormsModule
  ],
  declarations: [CancelSessionPage]
})
export class CancelSessionPageModule {}
