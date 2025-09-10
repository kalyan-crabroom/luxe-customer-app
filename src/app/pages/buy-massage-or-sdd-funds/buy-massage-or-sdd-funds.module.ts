import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BuyMassageOrSddFundsPageRoutingModule } from './buy-massage-or-sdd-funds-routing.module';

import { BuyMassageOrSddFundsPage } from './buy-massage-or-sdd-funds.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BuyMassageOrSddFundsPageRoutingModule
  ],
  declarations: [BuyMassageOrSddFundsPage]
})
export class BuyMassageOrSddFundsPageModule {}
