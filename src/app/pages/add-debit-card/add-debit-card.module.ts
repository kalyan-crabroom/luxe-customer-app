import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddDebitCardPageRoutingModule } from './add-debit-card-routing.module';

import { AddDebitCardPage } from './add-debit-card.page';
import { ShareModule } from 'src/app/share/share.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddDebitCardPageRoutingModule,
    ReactiveFormsModule,
    ShareModule
  ],
  declarations: [AddDebitCardPage]
})
export class AddDebitCardPageModule {}
