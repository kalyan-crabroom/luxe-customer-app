import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReportSessionPageRoutingModule } from './report-session-routing.module';

import { ReportSessionPage } from './report-session.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReportSessionPageRoutingModule,ReactiveFormsModule
  ],
  declarations: [ReportSessionPage]
})
export class ReportSessionPageModule {}
