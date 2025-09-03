import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyTransactionsPage } from './my-transactions.page';

describe('MyTransactionsPage', () => {
  let component: MyTransactionsPage;
  let fixture: ComponentFixture<MyTransactionsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MyTransactionsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
