import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Tab4Page } from './tab4.page';

const routes: Routes = [
  {
    path: '',
    component: Tab4Page
  },
  {
    path: 'request-history/:details',
    loadChildren: () => import('../pages/request-history/request-history.module').then( m => m.RequestHistoryPageModule)
  },
  {
    path: 'session-info/:customer_id',
    loadChildren: () => import('../pages/session-info/session-info.module').then( m => m.SessionInfoPageModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class Tab4PageRoutingModule {}
