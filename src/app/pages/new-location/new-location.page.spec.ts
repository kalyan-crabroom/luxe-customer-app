import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NewLocationPage } from './new-location.page';

describe('NewLocationPage', () => {
  let component: NewLocationPage;
  let fixture: ComponentFixture<NewLocationPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NewLocationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
