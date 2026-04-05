import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ReviewService } from './review.service';
import { Review, ReviewPaginationResponse } from '../models/review.model';

describe('ReviewService', () => {
  let service: ReviewService;
  let httpMock: HttpTestingController;

  const mockReview: Review = {
    id: '1',
    title: 'Test Review',
    author: 'Author',
    bookTitle: 'Book',
    bookAuthor: 'Book Author',
    rating: 5,
    genre: 'fiction',
    description: 'Desc',
    content: 'Content',
    publishedAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'user',
    isPublished: true,
  };

  const mockPaginationResponse: ReviewPaginationResponse = {
    data: [mockReview],
    total: 1,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ReviewService],
    });
    service = TestBed.inject(ReviewService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getReviews() should fetch reviews and return pagination response', () => {
    service.getReviews().subscribe((res) => {
      expect(res).toEqual(mockPaginationResponse);
      expect(res.data.length).toBe(1);
      expect(res.data[0].title).toBe('Test Review');
    });

    const req = httpMock.expectOne((r) => r.url.includes('/reviews'));
    expect(req.request.method).toBe('GET');
    req.flush(mockPaginationResponse);
  });

  it('getReviews$() should emit reviews after getReviews() succeeds', (done) => {
    service.getReviews$().subscribe((reviews) => {
      if (reviews.length > 0) {
        expect(reviews[0].title).toBe('Test Review');
        done();
      }
    });

    service.getReviews().subscribe();
    const req = httpMock.expectOne((r) => r.url.includes('/reviews'));
    req.flush(mockPaginationResponse);
  });

  it('getReviews() with filters should pass params', () => {
    service.getReviews({ genre: 'fiction', page: 2, limit: 5 }).subscribe();

    const req = httpMock.expectOne((r) => r.url.includes('/reviews'));
    expect(req.request.params.get('genre')).toBe('fiction');
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('limit')).toBe('5');
    req.flush(mockPaginationResponse);
  });

  it('getReviewById() should fetch single review', () => {
    service.getReviewById('1').subscribe((review) => {
      expect(review).toEqual(mockReview);
    });

    const req = httpMock.expectOne((r) => r.url.includes('/reviews/1'));
    expect(req.request.method).toBe('GET');
    req.flush(mockReview);
  });

  it('createReview() should POST new review', () => {
    const newReview = { ...mockReview, title: 'New' };
    service.createReview(newReview).subscribe();

    const req = httpMock.expectOne((r) => r.url.includes('/reviews'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body.title).toBe('New');
    req.flush(mockReview);
  });

  it('updateReview() should PUT review', () => {
    service.updateReview('1', { title: 'Updated' }).subscribe();

    const req = httpMock.expectOne((r) => r.url.includes('/reviews/1'));
    expect(req.request.method).toBe('PUT');
    expect(req.request.body.title).toBe('Updated');
    req.flush(mockReview);
  });

  it('deleteReview() should DELETE review', () => {
    service.deleteReview('1').subscribe();

    const req = httpMock.expectOne((r) => r.url.includes('/reviews/1'));
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('getLoading$() should emit loading state', () => {
    const emissions: boolean[] = [];
    const sub = service.getLoading$().subscribe((loading) => emissions.push(loading));

    expect(emissions).toEqual([false]);

    service.getReviews().subscribe();
    expect(emissions).toEqual([false, true]);

    const req = httpMock.expectOne((r) => r.url.includes('/reviews'));
    req.flush(mockPaginationResponse);

    expect(emissions).toEqual([false, true, false]);
    sub.unsubscribe();
  });

  it('getReviews() on API error should return empty pagination (after retries)', (done) => {
    const errorOpts = { status: 500, statusText: 'Internal Server Error' };
    service.getReviews().subscribe((res) => {
      expect(res.data).toEqual([]);
      expect(res.total).toBe(0);
      expect(res.totalPages).toBe(0);
      done();
    });
    // Service uses retry(2): 1 initial + 2 retries = 3 requests
    for (let i = 0; i < 3; i++) {
      const req = httpMock.expectOne((r) => r.url.includes('/reviews'));
      req.flush('Server error', errorOpts);
    }
  });
});
