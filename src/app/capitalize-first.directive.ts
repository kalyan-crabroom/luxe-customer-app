import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appCapitalizeFirst]',
  standalone: false
})
export class CapitalizeFirstDirective {

  constructor(private el: ElementRef) { }

  @HostListener('input', ['$event'])
  // onInput(event: Event) {
  //   let input = this.el.nativeElement;
  //   let value = input.value;
  //   if (value.length > 0) {
  //     input.value = value.charAt(0).toUpperCase() + value.slice(1);
  //   }
  // }

  onInput(event: Event) {
    const input = this.el.nativeElement;
    const value = input.value;

    input.value = value
      .toLowerCase()
      .split(' ')
      .map((word:any) => word?.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

}
