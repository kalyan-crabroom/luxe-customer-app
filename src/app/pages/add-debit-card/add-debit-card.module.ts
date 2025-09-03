import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddDebitCardPageRoutingModule } from './add-debit-card-routing.module';

import { AddDebitCardPage } from './add-debit-card.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddDebitCardPageRoutingModule
  ],
  declarations: [AddDebitCardPage]
})
export class AddDebitCardPageModule {}
