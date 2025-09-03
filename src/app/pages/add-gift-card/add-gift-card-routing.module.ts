import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddGiftCardPage } from './add-gift-card.page';

const routes: Routes = [
  {
    path: '',
    component: AddGiftCardPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddGiftCardPageRoutingModule {}
