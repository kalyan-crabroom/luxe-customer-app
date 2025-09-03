import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CompleteRequestHistoryPage } from './complete-request-history.page';

const routes: Routes = [
  {
    path: '',
    component: CompleteRequestHistoryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CompleteRequestHistoryPageRoutingModule {}
