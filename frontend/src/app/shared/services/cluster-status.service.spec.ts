import { TestBed } from '@angular/core/testing';

import { ClusterStatusService } from '~/app/shared/services/cluster-status.service';
import { TestingModule } from '~/app/testing.module';

describe('ClusterStatusService', () => {
  let service: ClusterStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestingModule]
    });
    service = TestBed.inject(ClusterStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
