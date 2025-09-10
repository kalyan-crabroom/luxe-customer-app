import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GuestDetails2Page } from './guest-details2.page';

describe('GuestDetails2Page', () => {
  let component: GuestDetails2Page;
  let fixture: ComponentFixture<GuestDetails2Page>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GuestDetails2Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
