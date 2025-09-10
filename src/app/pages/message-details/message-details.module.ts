import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MessageDetailsPageRoutingModule } from './message-details-routing.module';

import { MessageDetailsPage } from './message-details.page';
// import { EmojiModule } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MessageDetailsPageRoutingModule,
    PickerComponent
  ],
  declarations: [MessageDetailsPage]
})
export class MessageDetailsPageModule {}
