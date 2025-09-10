import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookNow2Page } from './book-now2.page';

describe('BookNow2Page', () => {
  let component: BookNow2Page;
  let fixture: ComponentFixture<BookNow2Page>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BookNow2Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
