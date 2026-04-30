import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { of, BehaviorSubject } from 'rxjs';
import { Review } from '../../models/review.model';
import { ReviewListComponent } from './review-list.component';
import { ReviewService } from '../../services/review.service';

describe('ReviewListComponent', () => {
  let component: ReviewListComponent;
  let fixture: ComponentFixture<ReviewListComponent>;
  let mockReviewService: jasmine.SpyObj<ReviewService>;
  let router: Router;
  const reviewsSubject = new BehaviorSubject<Review[]>([]);
  const loadingSubject = new BehaviorSubject<boolean>(false);
  const queryParamsSubject = new BehaviorSubject<Params>({});

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

    await TestBed.configureTestingModule({
      imports: [ReviewListComponent, RouterTestingModule],
      providers: [
        { provide: ReviewService, useValue: mockReviewService },
        { provide: ActivatedRoute, useValue: { queryParams: queryParamsSubject.asObservable() } },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    fixture = TestBed.createComponent(ReviewListComponent);
    component = fixture.componentInstance;
    loadingSubject.next(false);
    reviewsSubject.next([]);
    queryParamsSubject.next({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getReviews on init (triggered by queryParams emission)', () => {
    expect(mockReviewService.getReviews).toHaveBeenCalled();
  });

  it('should initialize filters from URL query params', () => {
    queryParamsSubject.next({ genre: 'fiction', rating: '4', sort: 'newest', page: '2', search: 'test' });
    fixture.detectChanges();
    expect(component.selectedGenre).toBe('fiction');
    expect(component.selectedRating).toBe('4');
    expect(component.selectedSort).toBe('newest');
    expect(component.currentPage).toBe(2);
    expect(component.searchQuery).toBe('test');
  });

  it('should call getReviews with filters from URL query params', () => {
    mockReviewService.getReviews.calls.reset();
    queryParamsSubject.next({ genre: 'fiction', page: '2' });
    fixture.detectChanges();
    expect(mockReviewService.getReviews).toHaveBeenCalledWith(jasmine.objectContaining({
      genre: 'fiction',
      page: 2,
    }));
  });

  it('should show skeleton placeholders and aria-busy while loading', () => {
    loadingSubject.next(true);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('app-review-card-skeleton').length).toBe(6);
    const region = el.querySelector('[aria-live="polite"]');
    expect(region?.getAttribute('aria-busy')).toBe('true');
    loadingSubject.next(false);
    fixture.detectChanges();
    expect(el.querySelectorAll('app-review-card-skeleton').length).toBe(0);
    expect(region?.getAttribute('aria-busy')).toBe('false');
  });

  it('should call router.navigate with current filters when onFilterChange is called', () => {
    component.selectedGenre = 'fiction';
    component.onFilterChange();
    expect(router.navigate).toHaveBeenCalledWith([], jasmine.objectContaining({
      queryParams: jasmine.objectContaining({ genre: 'fiction' }),
      queryParamsHandling: 'replace',
    }));
  });

  it('should reset currentPage to 1 when onFilterChange is called', () => {
    component.currentPage = 3;
    component.onFilterChange();
    expect(component.currentPage).toBe(1);
  });

  it('should debounce search input and sync URL params after delay', fakeAsync(() => {
    component.currentPage = 3;
    component.searchQuery = 'novel';
    component.onSearchQueryInput();
    expect(router.navigate).not.toHaveBeenCalled();
    tick(350);
    expect(component.currentPage).toBe(1);
    expect(router.navigate).toHaveBeenCalledWith([], jasmine.objectContaining({
      queryParams: jasmine.objectContaining({ search: 'novel' }),
      queryParamsHandling: 'replace',
    }));
  }));

  it('should reset filters and navigate with null params on resetFilters', () => {
    component.searchQuery = 'test';
    component.selectedGenre = 'fiction';
    component.resetFilters();
    expect(component.searchQuery).toBe('');
    expect(component.selectedGenre).toBe('');
    expect(component.currentPage).toBe(1);
    expect(router.navigate).toHaveBeenCalledWith([], jasmine.objectContaining({
      queryParams: jasmine.objectContaining({ search: null, genre: null }),
      queryParamsHandling: 'replace',
    }));
  });

  it('should call router.navigate on pagination change', () => {
    component.onPaginationChange({ page: 2, limit: 20 });
    expect(component.currentPage).toBe(2);
    expect(component.pageSize).toBe(20);
    expect(router.navigate).toHaveBeenCalledWith([], jasmine.objectContaining({
      queryParams: jasmine.objectContaining({ page: 2 }),
      queryParamsHandling: 'replace',
    }));
  });

  it('should omit page param from URL when on page 1', () => {
    component.currentPage = 1;
    component.onFilterChange();
    expect(router.navigate).toHaveBeenCalledWith([], jasmine.objectContaining({
      queryParams: jasmine.objectContaining({ page: null }),
    }));
  });

  it('should render one routerLink per review card (no duplicate navigation targets)', () => {
    reviewsSubject.next([
      {
        id: '1',
        title: 'T',
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
      },
    ]);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const links = el.querySelectorAll('a[href="/reviews/1"]');
    expect(links.length).toBe(1);
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
