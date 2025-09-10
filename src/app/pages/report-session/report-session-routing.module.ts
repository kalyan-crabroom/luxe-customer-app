import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReportSessionPage } from './report-session.page';

const routes: Routes = [
  {
    path: '',
    component: ReportSessionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportSessionPageRoutingModule {}
