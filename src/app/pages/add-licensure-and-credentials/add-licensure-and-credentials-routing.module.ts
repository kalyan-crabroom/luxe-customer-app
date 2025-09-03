import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddLicensureAndCredentialsPage } from './add-licensure-and-credentials.page';

const routes: Routes = [
  {
    path: '',
    component: AddLicensureAndCredentialsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddLicensureAndCredentialsPageRoutingModule {}
