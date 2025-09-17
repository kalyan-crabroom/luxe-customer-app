import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
    selector: '[appAutofill]'
})
export class AutofillDirective {

    constructor(private el: ElementRef) { }

    @HostListener('animationstart', ['$event'])
    onAnimationStart(e: AnimationEvent) {
        // Webkit autofill detection
        if (e.animationName === 'onAutoFillStart') {
            this.el.nativeElement.classList.add('input-has-value');
        } else if (e.animationName === 'onAutoFillCancel') {
            this.el.nativeElement.classList.remove('input-has-value');
        }
    }

    @HostListener('input', ['$event'])
    onInput(e: Event) {
        // Handle input changes for autofilled values
        const target = e.target as HTMLInputElement;
        if (target && target.value) {
            // Trigger change detection for Angular forms
            const changeEvent = new Event('change', { bubbles: true });
            target.dispatchEvent(changeEvent);
        }
    }
}