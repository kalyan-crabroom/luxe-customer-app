import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BookNow1PageRoutingModule } from './book-now1-routing.module';

import { BookNow1Page } from './book-now1.page';
import { ShareModule } from 'src/app/share/share.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BookNow1PageRoutingModule,
    ReactiveFormsModule,
    ShareModule,
  ],
  declarations: [BookNow1Page]
})
export class BookNow1PageModule {}
