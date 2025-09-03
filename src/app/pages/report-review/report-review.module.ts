import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReportReviewPageRoutingModule } from './report-review-routing.module';

import { ReportReviewPage } from './report-review.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReportReviewPageRoutingModule
  ],
  declarations: [ReportReviewPage]
})
export class ReportReviewPageModule {}
