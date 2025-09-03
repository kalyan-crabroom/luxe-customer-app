import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NotificationSettingsPageRoutingModule } from './notification-settings-routing.module';

import { NotificationSettingsPage } from './notification-settings.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NotificationSettingsPageRoutingModule,ReactiveFormsModule
  ],
  declarations: [NotificationSettingsPage]
})
export class NotificationSettingsPageModule {}
