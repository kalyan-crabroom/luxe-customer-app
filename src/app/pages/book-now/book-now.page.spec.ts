import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookNowPage } from './book-now.page';

describe('BookNowPage', () => {
  let component: BookNowPage;
  let fixture: ComponentFixture<BookNowPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BookNowPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
