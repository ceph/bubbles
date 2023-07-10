import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { CephRgwUsersService } from '~/app/shared/services/api/ceph-rgw-users.service';

describe('CephRgwUsersService', () => {
  let service: CephRgwUsersService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CephRgwUsersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call list', () => {
    service.list().subscribe();
    const req = httpTesting.expectOne('api/ceph/rgw/users');
    expect(req.request.method).toBe('GET');
  });

  it('should call delete', () => {
    service.delete('foo').subscribe();
    const req = httpTesting.expectOne('api/ceph/rgw/users/foo');
    expect(req.request.method).toBe('DELETE');
  });
});
