import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GuestDetails2Page } from './guest-details2.page';

const routes: Routes = [
  {
    path: '',
    component: GuestDetails2Page
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GuestDetails2PageRoutingModule {}
