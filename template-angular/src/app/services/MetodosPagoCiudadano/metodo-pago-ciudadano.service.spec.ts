import { TestBed } from '@angular/core/testing';

import { MetodoPagoCiudadanoService } from './metodo-pago-ciudadano.service';

describe('MetodoPagoCiudadanoService', () => {
  let service: MetodoPagoCiudadanoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MetodoPagoCiudadanoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
