import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WalletPageRoutingModule } from './wallet-routing.module';

import { WalletPage } from './wallet.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WalletPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [WalletPage]
})
export class WalletPageModule {}
