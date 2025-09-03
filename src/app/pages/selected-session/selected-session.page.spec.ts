import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectedSessionPage } from './selected-session.page';

describe('SelectedSessionPage', () => {
  let component: SelectedSessionPage;
  let fixture: ComponentFixture<SelectedSessionPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectedSessionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
