import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddGiftCardPageRoutingModule } from './add-gift-card-routing.module';

import { AddGiftCardPage } from './add-gift-card.page';
import { ShareModule } from 'src/app/share/share.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddGiftCardPageRoutingModule,
    ReactiveFormsModule,
    ShareModule
  ],
  declarations: [AddGiftCardPage]
})
export class AddGiftCardPageModule {}
