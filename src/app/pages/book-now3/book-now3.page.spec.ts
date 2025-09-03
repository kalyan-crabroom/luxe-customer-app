import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookNow3Page } from './book-now3.page';

describe('BookNow3Page', () => {
  let component: BookNow3Page;
  let fixture: ComponentFixture<BookNow3Page>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BookNow3Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
