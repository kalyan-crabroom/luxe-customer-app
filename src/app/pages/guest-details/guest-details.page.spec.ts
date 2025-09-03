import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GuestDetailsPage } from './guest-details.page';

describe('GuestDetailsPage', () => {
  let component: GuestDetailsPage;
  let fixture: ComponentFixture<GuestDetailsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GuestDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
