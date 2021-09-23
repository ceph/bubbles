import { TestBed } from '@angular/core/testing';

import { SvcService } from '~/app/shared/services/svc.service';
import { TestingModule } from '~/app/testing.module';

describe('SvcService', () => {
  let service: SvcService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestingModule]
    });
    service = TestBed.inject(SvcService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
