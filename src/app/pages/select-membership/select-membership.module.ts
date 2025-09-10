import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SelectMembershipPageRoutingModule } from './select-membership-routing.module';

import { SelectMembershipPage } from './select-membership.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SelectMembershipPageRoutingModule
  ],
  declarations: [SelectMembershipPage]
})
export class SelectMembershipPageModule {}
