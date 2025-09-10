import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportSessionPage } from './report-session.page';

describe('ReportSessionPage', () => {
  let component: ReportSessionPage;
  let fixture: ComponentFixture<ReportSessionPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportSessionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
