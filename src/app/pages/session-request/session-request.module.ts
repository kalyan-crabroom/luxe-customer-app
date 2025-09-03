import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SessionRequestPageRoutingModule } from './session-request-routing.module';

import { SessionRequestPage } from './session-request.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SessionRequestPageRoutingModule
  ],
  declarations: [SessionRequestPage]
})
export class SessionRequestPageModule {}
