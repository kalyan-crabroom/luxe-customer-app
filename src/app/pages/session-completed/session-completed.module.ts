import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SessionCompletedPageRoutingModule } from './session-completed-routing.module';

import { SessionCompletedPage } from './session-completed.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SessionCompletedPageRoutingModule,ReactiveFormsModule
  ],
  declarations: [SessionCompletedPage]
})
export class SessionCompletedPageModule {}
