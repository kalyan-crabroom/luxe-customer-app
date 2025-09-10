import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BookNowPageRoutingModule } from './book-now-routing.module';

import { BookNowPage } from './book-now.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BookNowPageRoutingModule
  ],
  declarations: [BookNowPage]
})
export class BookNowPageModule {}
