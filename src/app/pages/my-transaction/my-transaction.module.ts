import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MyTransactionPageRoutingModule } from './my-transaction-routing.module';

import { MyTransactionPage } from './my-transaction.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MyTransactionPageRoutingModule
  ],
  declarations: [MyTransactionPage]
})
export class MyTransactionPageModule {}
