import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SessionInfoPage } from './session-info.page';

describe('SessionInfoPage', () => {
  let component: SessionInfoPage;
  let fixture: ComponentFixture<SessionInfoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SessionInfoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
