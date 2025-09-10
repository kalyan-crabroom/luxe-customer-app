import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookNow1Page } from './book-now1.page';

describe('BookNow1Page', () => {
  let component: BookNow1Page;
  let fixture: ComponentFixture<BookNow1Page>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BookNow1Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
