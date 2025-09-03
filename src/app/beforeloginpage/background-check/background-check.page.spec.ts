import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BackgroundCheckPage } from './background-check.page';

describe('BackgroundCheckPage', () => {
  let component: BackgroundCheckPage;
  let fixture: ComponentFixture<BackgroundCheckPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BackgroundCheckPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
