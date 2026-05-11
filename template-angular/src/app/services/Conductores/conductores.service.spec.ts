import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ConductoresService } from './conductores.service';

describe('ConductoresService', () => {
  let service: ConductoresService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ConductoresService]
    });
    service = TestBed.inject(ConductoresService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
