import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookNowFirstTimeClientPage } from './book-now-first-time-client.page';

describe('BookNowFirstTimeClientPage', () => {
  let component: BookNowFirstTimeClientPage;
  let fixture: ComponentFixture<BookNowFirstTimeClientPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BookNowFirstTimeClientPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
