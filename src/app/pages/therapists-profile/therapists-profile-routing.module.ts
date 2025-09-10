import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TherapistsProfilePage } from './therapists-profile.page';

const routes: Routes = [
  {
    path: '',
    component: TherapistsProfilePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TherapistsProfilePageRoutingModule {}
