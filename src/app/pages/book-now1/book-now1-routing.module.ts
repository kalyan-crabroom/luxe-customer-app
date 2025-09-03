import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BookNow1Page } from './book-now1.page';

const routes: Routes = [
  {
    path: '',
    component: BookNow1Page
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BookNow1PageRoutingModule {}
