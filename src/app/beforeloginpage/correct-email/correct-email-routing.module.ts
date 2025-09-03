import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CorrectEmailPage } from './correct-email.page';

const routes: Routes = [
  {
    path: '',
    component: CorrectEmailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CorrectEmailPageRoutingModule {}
