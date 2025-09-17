import { AutofillDirective } from './autofill.directive';
import { ElementRef } from '@angular/core';

describe('AutofillDirective', () => {
    it('should create an instance', () => {
        const mockElementRef = new ElementRef(document.createElement('input'));
        const directive = new AutofillDirective(mockElementRef);
        expect(directive).toBeTruthy();
    });
});
