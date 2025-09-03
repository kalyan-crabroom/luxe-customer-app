import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EmergencyContanctPage } from './emergency-contanct.page';

const routes: Routes = [
  {
    path: '',
    component: EmergencyContanctPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EmergencyContanctPageRoutingModule {}
