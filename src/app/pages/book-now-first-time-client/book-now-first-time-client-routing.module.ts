import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BookNowFirstTimeClientPage } from './book-now-first-time-client.page';

const routes: Routes = [
  {
    path: '',
    component: BookNowFirstTimeClientPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BookNowFirstTimeClientPageRoutingModule {}
