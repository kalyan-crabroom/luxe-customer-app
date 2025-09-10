import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { Tab4PageRoutingModule } from './tab4-routing.module';

import { Tab4Page } from './tab4.page';
import { NgCalendarModule  } from 'ionic2-calendar';
import { DatePipe } from '@angular/common';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    Tab4PageRoutingModule,
    NgCalendarModule
    ],
  declarations: [Tab4Page],
  providers: [DatePipe]
})
export class Tab4PageModule {}
