import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CancelSessionPage } from './cancel-session.page';

describe('CancelSessionPage', () => {
  let component: CancelSessionPage;
  let fixture: ComponentFixture<CancelSessionPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CancelSessionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
