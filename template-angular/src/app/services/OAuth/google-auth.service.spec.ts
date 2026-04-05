import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GoogleAuthService } from './google-auth.service';
import { environment } from '../../../environments/environment';

describe('GoogleAuthService', () => {
  let service: GoogleAuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GoogleAuthService]
    });
    service = TestBed.inject(GoogleAuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return a Google OAuth URL', () => {
    const mockResponse = { url: 'https://accounts.google.com/o/oauth2/auth?mock=true' };

    service.getGoogleUrl().subscribe((res) => {
      expect(res.url).toBe(mockResponse.url);
    });

    const req = httpMock.expectOne(`${environment.url_ms_security}/auth/google/url`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
});
