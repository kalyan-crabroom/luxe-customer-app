import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SessionCompletedPage } from './session-completed.page';

const routes: Routes = [
  {
    path: '',
    component: SessionCompletedPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SessionCompletedPageRoutingModule {}
