import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddBankAccountPage } from './add-bank-account.page';

const routes: Routes = [
  {
    path: '',
    component: AddBankAccountPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddBankAccountPageRoutingModule {}
