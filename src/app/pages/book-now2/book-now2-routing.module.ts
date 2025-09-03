import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BookNow2Page } from './book-now2.page';

const routes: Routes = [
  {
    path: '',
    component: BookNow2Page
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BookNow2PageRoutingModule {}
