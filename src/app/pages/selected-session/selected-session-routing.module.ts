import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SelectedSessionPage } from './selected-session.page';

const routes: Routes = [
  {
    path: '',
    component: SelectedSessionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SelectedSessionPageRoutingModule {}
