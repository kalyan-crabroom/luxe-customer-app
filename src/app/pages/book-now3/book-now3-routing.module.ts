import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BookNow3Page } from './book-now3.page';

const routes: Routes = [
  {
    path: '',
    component: BookNow3Page
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BookNow3PageRoutingModule {}
