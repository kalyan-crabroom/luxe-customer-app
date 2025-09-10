import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SelectMembershipPage } from './select-membership.page';

const routes: Routes = [
  {
    path: '',
    component: SelectMembershipPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SelectMembershipPageRoutingModule {}
