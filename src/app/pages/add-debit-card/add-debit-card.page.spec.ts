import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddDebitCardPage } from './add-debit-card.page';

describe('AddDebitCardPage', () => {
  let component: AddDebitCardPage;
  let fixture: ComponentFixture<AddDebitCardPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AddDebitCardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
