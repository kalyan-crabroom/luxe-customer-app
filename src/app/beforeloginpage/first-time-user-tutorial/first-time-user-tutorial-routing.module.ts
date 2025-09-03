import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FirstTimeUserTutorialPage } from './first-time-user-tutorial.page';

const routes: Routes = [
  {
    path: '',
    component: FirstTimeUserTutorialPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FirstTimeUserTutorialPageRoutingModule {}
