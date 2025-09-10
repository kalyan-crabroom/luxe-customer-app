import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddLicensureAndCredentialsPage } from './add-licensure-and-credentials.page';

describe('AddLicensureAndCredentialsPage', () => {
  let component: AddLicensureAndCredentialsPage;
  let fixture: ComponentFixture<AddLicensureAndCredentialsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AddLicensureAndCredentialsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
