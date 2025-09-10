import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BookNowFirstTimeClientPageRoutingModule } from './book-now-first-time-client-routing.module';

import { BookNowFirstTimeClientPage } from './book-now-first-time-client.page';
import { ShareModule } from 'src/app/share/share.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BookNowFirstTimeClientPageRoutingModule,
    ReactiveFormsModule,
    ShareModule
  ],
  declarations: [BookNowFirstTimeClientPage]
})
export class BookNowFirstTimeClientPageModule {}
