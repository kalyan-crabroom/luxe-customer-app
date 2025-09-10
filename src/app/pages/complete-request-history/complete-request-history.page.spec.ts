import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CompleteRequestHistoryPage } from './complete-request-history.page';

describe('CompleteRequestHistoryPage', () => {
  let component: CompleteRequestHistoryPage;
  let fixture: ComponentFixture<CompleteRequestHistoryPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CompleteRequestHistoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
