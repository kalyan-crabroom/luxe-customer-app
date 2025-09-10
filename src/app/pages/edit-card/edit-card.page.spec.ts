import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditCardPage } from './edit-card.page';

describe('EditCardPage', () => {
  let component: EditCardPage;
  let fixture: ComponentFixture<EditCardPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EditCardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
