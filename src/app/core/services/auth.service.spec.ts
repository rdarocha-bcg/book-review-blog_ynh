import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { ApiService } from './api.service';
import { StorageService } from './storage.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let storage: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService, ApiService, StorageService],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    storage = TestBed.inject(StorageService);
    storage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    storage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('login() should call API and store token and user', (done) => {
    const credentials = { email: 'a@b.com', password: 'pass' };
    const response = { token: 'jwt123', user: { id: '1', email: 'a@b.com', name: 'User' } };

    service.login(credentials).subscribe((res) => {
      expect(res).toEqual(response);
      expect(service.getToken()).toBe('jwt123');
      expect(service.getCurrentUser()).toEqual(response.user);
      done();
    });

    const req = httpMock.expectOne((r) => r.url.includes('auth/login'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(credentials);
    req.flush(response);
  });

  it('register() should call API and store token and user', (done) => {
    const userData = { name: 'U', email: 'u@u.com', password: 'pass' };
    const response = { token: 'jwt456', user: { id: '2', email: 'u@u.com', name: 'U' } };

    service.register(userData).subscribe((res) => {
      expect(res.token).toBe('jwt456');
      expect(service.getToken()).toBe('jwt456');
      done();
    });

    const req = httpMock.expectOne((r) => r.url.includes('auth/register'));
    expect(req.request.method).toBe('POST');
    req.flush(response);
  });

  it('logout() should clear token and user', () => {
    storage.setItem('auth_token', 'x');
    storage.setItem('auth_user', { id: '1' });
    service.logout();
    expect(service.getToken()).toBeNull();
    expect(service.getCurrentUser()).toBeNull();
    expect(storage.hasItem('auth_token')).toBe(false);
  });

  it('isAuthenticatedSync() should reflect token presence', () => {
    expect(service.isAuthenticatedSync()).toBe(false);
    storage.setItem('auth_token', 't');
    // Re-create service to pick up new storage state, or call login
    service.login({ email: 'a@b.com', password: 'p' }).subscribe();
    const req = httpMock.expectOne((r) => r.url.includes('auth/login'));
    req.flush({ token: 't', user: {} });
    expect(service.isAuthenticatedSync()).toBe(true);
  });

  it('refreshToken() should POST auth/refresh and update token', (done) => {
    storage.setItem('auth_token', 'old');
    const newResponse = { token: 'new_token' };

    service.refreshToken().subscribe(() => {
      expect(service.getToken()).toBe('new_token');
      done();
    });

    const req = httpMock.expectOne((r) => r.url.includes('auth/refresh'));
    expect(req.request.method).toBe('POST');
    req.flush(newResponse);
  });

  it('login() on API error should propagate error', (done) => {
    service.login({ email: 'a@b.com', password: 'wrong' }).subscribe({
      next: () => done.fail('expected error'),
      error: () => {
        expect(service.getToken()).toBeNull();
        done();
      },
    });
    const req = httpMock.expectOne((r) => r.url.includes('auth/login'));
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
  });
});
