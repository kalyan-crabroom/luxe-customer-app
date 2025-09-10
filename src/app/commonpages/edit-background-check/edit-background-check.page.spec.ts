import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditBackgroundCheckPage } from './edit-background-check.page';

describe('EditBackgroundCheckPage', () => {
  let component: EditBackgroundCheckPage;
  let fixture: ComponentFixture<EditBackgroundCheckPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EditBackgroundCheckPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
