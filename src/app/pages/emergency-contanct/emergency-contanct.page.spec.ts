import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmergencyContanctPage } from './emergency-contanct.page';

describe('EmergencyContanctPage', () => {
  let component: EmergencyContanctPage;
  let fixture: ComponentFixture<EmergencyContanctPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EmergencyContanctPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
