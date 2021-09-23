import { TestBed } from '@angular/core/testing';

import { StorageService } from '~/app/shared/services/storage.service';
import { TestingModule } from '~/app/testing.module';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestingModule] });
    service = TestBed.inject(StorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
