import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { CephFsService } from '~/app/shared/services/api/ceph-fs.service';
import { TestingModule } from '~/app/testing.module';

describe('CephFsService', () => {
  let service: CephFsService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestingModule]
    });
    service = TestBed.inject(CephFsService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call authorization', () => {
    service.authorization('foo').subscribe();
    const req = httpTesting.expectOne('api/ceph/fs/foo/auth');
    expect(req.request.method).toBe('GET');
  });
});
