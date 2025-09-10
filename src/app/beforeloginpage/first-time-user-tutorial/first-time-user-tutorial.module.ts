import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FirstTimeUserTutorialPageRoutingModule } from './first-time-user-tutorial-routing.module';

import { FirstTimeUserTutorialPage } from './first-time-user-tutorial.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FirstTimeUserTutorialPageRoutingModule
  ],
  declarations: [FirstTimeUserTutorialPage]
})
export class FirstTimeUserTutorialPageModule {}
