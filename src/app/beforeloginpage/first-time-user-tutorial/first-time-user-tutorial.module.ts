import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FirstTimeUserTutorialPageRoutingModule } from './first-time-user-tutorial-routing.module';

import { FirstTimeUserTutorialPage } from './first-time-user-tutorial.page';
// import { SwiperModule } from 'swiper/angular';  

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule.forRoot(),
    FirstTimeUserTutorialPageRoutingModule,
    // SwiperModule
  ],
  declarations: [FirstTimeUserTutorialPage],
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class FirstTimeUserTutorialPageModule {}
