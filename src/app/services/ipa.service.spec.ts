import { TestBed } from '@angular/core/testing';

import { IpaService } from './ipa.service';

describe('IpaService', () => {
  let service: IpaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IpaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
