import { TestBed } from '@angular/core/testing';

import { SvcService } from './svc.service';

describe('SvcService', () => {
  let service: SvcService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SvcService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
