import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GiftCardsPageRoutingModule } from './gift-cards-routing.module';

import { GiftCardsPage } from './gift-cards.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GiftCardsPageRoutingModule
  ],
  declarations: [GiftCardsPage]
})
export class GiftCardsPageModule {}
