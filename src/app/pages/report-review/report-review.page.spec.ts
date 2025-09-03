import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportReviewPage } from './report-review.page';

describe('ReportReviewPage', () => {
  let component: ReportReviewPage;
  let fixture: ComponentFixture<ReportReviewPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportReviewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
