import { TestBed } from '@angular/core/testing';

import { ForgotPasswordService } from './password-reset.service';

describe('PasswordResetService', () => {
  let service: PasswordResetService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PasswordResetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
