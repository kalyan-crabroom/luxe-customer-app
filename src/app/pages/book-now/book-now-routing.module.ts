import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BookNowPage } from './book-now.page';

const routes: Routes = [
  {
    path: '',
    component: BookNowPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BookNowPageRoutingModule {}
