import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CorrectEmailPage } from './correct-email.page';

describe('CorrectEmailPage', () => {
  let component: CorrectEmailPage;
  let fixture: ComponentFixture<CorrectEmailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CorrectEmailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
