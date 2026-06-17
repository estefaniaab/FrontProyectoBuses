import { TestBed } from '@angular/core/testing';

import { DashboardBusesService } from './dashboard-buses.service';

describe('DashboardBusesService', () => {
  let service: DashboardBusesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DashboardBusesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
