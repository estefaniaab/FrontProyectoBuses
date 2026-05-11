import { TestBed } from '@angular/core/testing';

import { CiudadanoService } from './ciudadano.service';

describe('CiudadanoService', () => {
  let service: CiudadanoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CiudadanoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
