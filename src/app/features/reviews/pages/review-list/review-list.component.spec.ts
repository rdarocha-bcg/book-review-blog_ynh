import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, BehaviorSubject } from 'rxjs';
import { Review } from '../../models/review.model';
import { ReviewListComponent } from './review-list.component';
import { ReviewService } from '../../services/review.service';

describe('ReviewListComponent', () => {
  let component: ReviewListComponent;
  let fixture: ComponentFixture<ReviewListComponent>;
  let mockReviewService: jasmine.SpyObj<ReviewService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const reviewsSubject = new BehaviorSubject<Review[]>([]);
  const loadingSubject = new BehaviorSubject<boolean>(false);

  beforeEach(async () => {
    mockReviewService = jasmine.createSpyObj('ReviewService', ['getReviews', 'getReviews$', 'getLoading$']);
    mockReviewService.getReviews$.and.returnValue(reviewsSubject.asObservable());
    mockReviewService.getLoading$.and.returnValue(loadingSubject.asObservable());
    mockReviewService.getReviews.and.returnValue(of({
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    }));

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ReviewListComponent],
      providers: [
        { provide: ReviewService, useValue: mockReviewService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewListComponent);
    component = fixture.componentInstance;
    loadingSubject.next(false);
    reviewsSubject.next([]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getReviews on init', () => {
    expect(mockReviewService.getReviews).toHaveBeenCalled();
  });

  it('should call loadReviews when onFilterChange is called', () => {
    mockReviewService.getReviews.calls.reset();
    component.onFilterChange();
    expect(mockReviewService.getReviews).toHaveBeenCalled();
  });

  it('should reset filters and reload when resetFilters is called', () => {
    component.searchQuery = 'test';
    component.selectedGenre = 'fiction';
    mockReviewService.getReviews.calls.reset();
    component.resetFilters();
    expect(component.searchQuery).toBe('');
    expect(component.selectedGenre).toBe('');
    expect(component.currentPage).toBe(1);
    expect(mockReviewService.getReviews).toHaveBeenCalled();
  });

  it('should navigate to review when goToReview is called', () => {
    component.goToReview('123');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/reviews', '123']);
  });

  it('should update page and limit on pagination change and reload', () => {
    mockReviewService.getReviews.calls.reset();
    component.onPaginationChange({ page: 2, limit: 20 });
    expect(component.currentPage).toBe(2);
    expect(component.pageSize).toBe(20);
    expect(mockReviewService.getReviews).toHaveBeenCalledWith(jasmine.objectContaining({
      page: 2,
      limit: 20,
    }));
  });

  it('should track reviews by id', () => {
    const review = {
      id: '1',
      title: 'Test',
      author: 'A',
      bookTitle: 'B',
      bookAuthor: 'C',
      rating: 4,
      genre: 'fiction',
      description: 'd',
      content: 'c',
      publishedAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'u',
      isPublished: true,
    };
    expect(component.trackByReviewId(0, review)).toBe('1');
  });
});
