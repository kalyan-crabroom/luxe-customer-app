import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyTransactionPage } from './my-transaction.page';

describe('MyTransactionPage', () => {
  let component: MyTransactionPage;
  let fixture: ComponentFixture<MyTransactionPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MyTransactionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
