import { TestBed } from '@angular/core/testing';

import { SystemStatusService } from '~/app/shared/services/system-status.service';
import { TestingModule } from '~/app/testing.module';

describe('SystemStatusService', () => {
  let service: SystemStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestingModule]
    });
    service = TestBed.inject(SystemStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
