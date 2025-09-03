import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FirstTimeUserTutorialPage } from './first-time-user-tutorial.page';

describe('FirstTimeUserTutorialPage', () => {
  let component: FirstTimeUserTutorialPage;
  let fixture: ComponentFixture<FirstTimeUserTutorialPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FirstTimeUserTutorialPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
