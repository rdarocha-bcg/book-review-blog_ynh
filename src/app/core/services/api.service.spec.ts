import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ApiService } from './api.service';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService],
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('get() should perform GET request to correct URL', () => {
    const mockData = { id: '1', name: 'Test' };
    service.get<typeof mockData>('reviews').subscribe((data) => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne((r) => r.url.includes('/reviews'));
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });

  it('post() should perform POST request with body', () => {
    const body = { title: 'New Review' };
    const mockResponse = { id: '1', ...body };
    service.post<typeof mockResponse>('reviews', body).subscribe((data) => {
      expect(data).toEqual(mockResponse);
    });

    const req = httpMock.expectOne((r) => r.url.includes('/reviews'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush(mockResponse);
  });

  it('put() should perform PUT request with body', () => {
    const body = { title: 'Updated' };
    service.put('reviews/1', body).subscribe();

    const req = httpMock.expectOne((r) => r.url.includes('/reviews/1'));
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(body);
    req.flush({});
  });

  it('delete() should perform DELETE request', () => {
    service.delete('reviews/1').subscribe();

    const req = httpMock.expectOne((r) => r.url.includes('/reviews/1'));
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
