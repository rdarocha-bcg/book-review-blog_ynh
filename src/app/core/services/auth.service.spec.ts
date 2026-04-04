import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { ApiService } from './api.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService, ApiService],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('loadSession() should set user when authenticated', (done) => {
    service.loadSession().subscribe(() => {
      expect(service.isAuthenticatedSync()).toBe(true);
      expect(service.getCurrentUser()).toEqual({
        id: 'u1',
        email: 'a@b.com',
        name: 'Test',
        role: 'user',
      });
      done();
    });

    const req = httpMock.expectOne((r) => r.url.includes('auth/me'));
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBe(true);
    req.flush({
      authenticated: true,
      user: { id: 'u1', email: 'a@b.com', name: 'Test', role: 'user' },
    });
  });

  it('loadSession() should clear user when not authenticated', (done) => {
    service.loadSession().subscribe(() => {
      expect(service.isAuthenticatedSync()).toBe(false);
      expect(service.getCurrentUser()).toBeNull();
      done();
    });

    const req = httpMock.expectOne((r) => r.url.includes('auth/me'));
    req.flush({ authenticated: false });
  });

  it('logout() should clear user and POST auth/logout', () => {
    service.loadSession().subscribe();
    const r1 = httpMock.expectOne((r) => r.url.includes('auth/me'));
    r1.flush({ authenticated: true, user: { id: 'x' } });

    service.logout();
    expect(service.getCurrentUser()).toBeNull();
    expect(service.isAuthenticatedSync()).toBe(false);

    const r2 = httpMock.expectOne((r) => r.url.includes('auth/logout'));
    expect(r2.request.method).toBe('POST');
    r2.flush(null);
  });
});
