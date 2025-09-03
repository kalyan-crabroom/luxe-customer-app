import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CompleteRequestHistoryPageRoutingModule } from './complete-request-history-routing.module';

import { CompleteRequestHistoryPage } from './complete-request-history.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CompleteRequestHistoryPageRoutingModule
  ],
  declarations: [CompleteRequestHistoryPage]
})
export class CompleteRequestHistoryPageModule {}
