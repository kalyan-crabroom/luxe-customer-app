import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SessionCompletedPage } from './session-completed.page';

describe('SessionCompletedPage', () => {
  let component: SessionCompletedPage;
  let fixture: ComponentFixture<SessionCompletedPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SessionCompletedPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
