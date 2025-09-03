import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddBankAccountPageRoutingModule } from './add-bank-account-routing.module';

import { AddBankAccountPage } from './add-bank-account.page';
import { ShareModule } from 'src/app/share/share.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddBankAccountPageRoutingModule,
    ReactiveFormsModule,
    ShareModule
  ],
  declarations: [AddBankAccountPage]
})
export class AddBankAccountPageModule {}
