import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CapitalizeFirstDirective } from '../capitalize-first.directive';
import { AutofillDirective } from '../autofill.directive';

@NgModule({
  declarations: [CapitalizeFirstDirective, AutofillDirective],
  imports: [
    CommonModule
  ],
  exports: [
    CapitalizeFirstDirective,
    AutofillDirective
  ]
})
export class ShareModule { }
