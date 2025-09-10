import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BookNow2PageRoutingModule } from './book-now2-routing.module';

import { BookNow2Page } from './book-now2.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BookNow2PageRoutingModule
  ],
  declarations: [BookNow2Page]
})
export class BookNow2PageModule {}
