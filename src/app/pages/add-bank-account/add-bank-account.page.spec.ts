import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddBankAccountPage } from './add-bank-account.page';

describe('AddBankAccountPage', () => {
  let component: AddBankAccountPage;
  let fixture: ComponentFixture<AddBankAccountPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AddBankAccountPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
