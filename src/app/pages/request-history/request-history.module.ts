import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RequestHistoryPageRoutingModule } from './request-history-routing.module';

import { RequestHistoryPage } from './request-history.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RequestHistoryPageRoutingModule
  ],
  declarations: [RequestHistoryPage]
})
export class RequestHistoryPageModule {}
