import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TreatmentModalPage } from './treatment-modal.page';

describe('TreatmentModalPage', () => {
  let component: TreatmentModalPage;
  let fixture: ComponentFixture<TreatmentModalPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TreatmentModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
