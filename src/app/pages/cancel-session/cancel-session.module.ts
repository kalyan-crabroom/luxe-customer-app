import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CancelSessionPageRoutingModule } from './cancel-session-routing.module';

import { CancelSessionPage } from './cancel-session.page';
import { ShareModule } from 'src/app/share/share.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CancelSessionPageRoutingModule,
    ReactiveFormsModule,
    ShareModule
  ],
  declarations: [CancelSessionPage]
})
export class CancelSessionPageModule {}
