import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentInformationPage } from './payment-information.page';

describe('PaymentInformationPage', () => {
  let component: PaymentInformationPage;
  let fixture: ComponentFixture<PaymentInformationPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentInformationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
