import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SessionRequestPage } from './session-request.page';

describe('SessionRequestPage', () => {
  let component: SessionRequestPage;
  let fixture: ComponentFixture<SessionRequestPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SessionRequestPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
