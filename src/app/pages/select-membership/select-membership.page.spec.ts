import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectMembershipPage } from './select-membership.page';

describe('SelectMembershipPage', () => {
  let component: SelectMembershipPage;
  let fixture: ComponentFixture<SelectMembershipPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectMembershipPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
