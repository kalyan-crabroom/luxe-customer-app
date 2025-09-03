import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CompletedAppointmentsPage } from './completed-appointments.page';

describe('CompletedAppointmentsPage', () => {
  let component: CompletedAppointmentsPage;
  let fixture: ComponentFixture<CompletedAppointmentsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CompletedAppointmentsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
