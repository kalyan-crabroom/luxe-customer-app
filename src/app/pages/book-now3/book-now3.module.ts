import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BookNow3PageRoutingModule } from './book-now3-routing.module';

import { BookNow3Page } from './book-now3.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BookNow3PageRoutingModule
  ],
  declarations: [BookNow3Page]
})
export class BookNow3PageModule {}
