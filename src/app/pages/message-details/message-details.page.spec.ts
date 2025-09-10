import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageDetailsPage } from './message-details.page';

describe('MessageDetailsPage', () => {
  let component: MessageDetailsPage;
  let fixture: ComponentFixture<MessageDetailsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MessageDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
