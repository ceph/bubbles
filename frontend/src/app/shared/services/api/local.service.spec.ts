import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { LocalNodeService } from './local.service';

describe('LocalNodeService', () => {
  let service: LocalNodeService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(LocalNodeService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call local node status', () => {
    service.status().subscribe();
    const req = httpTesting.expectOne('api/local/status');
    expect(req.request.method).toBe('GET');
  });
});
