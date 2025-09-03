import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GiftCardsPage } from './gift-cards.page';

const routes: Routes = [
  {
    path: '',
    component: GiftCardsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GiftCardsPageRoutingModule {}
