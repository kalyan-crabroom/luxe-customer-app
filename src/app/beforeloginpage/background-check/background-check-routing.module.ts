import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BackgroundCheckPage } from './background-check.page';

const routes: Routes = [
  {
    path: '',
    component: BackgroundCheckPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BackgroundCheckPageRoutingModule {}
