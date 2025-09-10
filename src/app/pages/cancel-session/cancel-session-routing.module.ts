import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CancelSessionPage } from './cancel-session.page';

const routes: Routes = [
  {
    path: '',
    component: CancelSessionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CancelSessionPageRoutingModule {}
