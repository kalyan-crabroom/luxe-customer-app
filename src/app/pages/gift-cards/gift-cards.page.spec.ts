import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GiftCardsPage } from './gift-cards.page';

describe('GiftCardsPage', () => {
  let component: GiftCardsPage;
  let fixture: ComponentFixture<GiftCardsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GiftCardsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
