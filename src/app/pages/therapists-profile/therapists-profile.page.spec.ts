import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TherapistsProfilePage } from './therapists-profile.page';

describe('TherapistsProfilePage', () => {
  let component: TherapistsProfilePage;
  let fixture: ComponentFixture<TherapistsProfilePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TherapistsProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
