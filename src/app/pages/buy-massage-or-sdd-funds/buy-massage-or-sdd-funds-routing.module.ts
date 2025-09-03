import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BuyMassageOrSddFundsPage } from './buy-massage-or-sdd-funds.page';

const routes: Routes = [
  {
    path: '',
    component: BuyMassageOrSddFundsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BuyMassageOrSddFundsPageRoutingModule {}
