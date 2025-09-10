import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddGiftCardPage } from './add-gift-card.page';

describe('AddGiftCardPage', () => {
  let component: AddGiftCardPage;
  let fixture: ComponentFixture<AddGiftCardPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AddGiftCardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
