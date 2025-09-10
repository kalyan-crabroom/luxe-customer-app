import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CapitalizeFirstDirective } from '../capitalize-first.directive';

@NgModule({
  declarations: [CapitalizeFirstDirective],
  imports: [
    CommonModule
  ],
  exports: [
    CapitalizeFirstDirective
  ]
})
export class ShareModule { }
