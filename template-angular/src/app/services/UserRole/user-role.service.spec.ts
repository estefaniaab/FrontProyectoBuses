import { TestBed } from '@angular/core/testing';

import { UserRoleService } from './user-role.service';

describe('UserService', () => {
  let service: UserRoleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserRoleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
