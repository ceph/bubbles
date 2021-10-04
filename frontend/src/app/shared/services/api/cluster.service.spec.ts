import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ClusterService } from '~/app/shared/services/api/cluster.service';
import { TestingModule } from '~/app/testing.module';

describe('ClusterService', () => {
  let service: ClusterService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestingModule]
    });
    service = TestBed.inject(ClusterService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call df', () => {
    service.df().subscribe();
    const req = httpTesting.expectOne('api/cluster/df');
    expect(req.request.method).toBe('GET');
  });

  it('should call status', () => {
    service.status().subscribe();
    const req = httpTesting.expectOne('api/cluster/status');
    expect(req.request.method).toBe('GET');
  });

  it('should call clientIO', () => {
    service.clientIO().subscribe();
    const req = httpTesting.expectOne('api/cluster/client-io-rates');
    expect(req.request.method).toBe('GET');
  });

  it('should call events', () => {
    service.events().subscribe();
    const req = httpTesting.expectOne('api/cluster/events');
    expect(req.request.method).toBe('GET');
  });
});
