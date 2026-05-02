import { TestBed } from '@angular/core/testing';

import { ParaderoService } from './paradero.service';

describe('ParaderoService', () => {
  let service: ParaderoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ParaderoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

export class Paradero {
}
