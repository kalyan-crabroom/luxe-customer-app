import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CompletedAppointmentsPageRoutingModule } from './completed-appointments-routing.module';

import { CompletedAppointmentsPage } from './completed-appointments.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CompletedAppointmentsPageRoutingModule
  ],
  declarations: [CompletedAppointmentsPage]
})
export class CompletedAppointmentsPageModule {}
