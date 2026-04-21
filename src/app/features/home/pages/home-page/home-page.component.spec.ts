import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Subject } from 'rxjs';
import { HomePageComponent } from './home-page.component';
import { ReviewService } from '@features/reviews/services/review.service';
import { AcademicService } from '@features/academics/services/academic.service';
import { Review, ReviewPaginationResponse } from '@features/reviews/models/review.model';
import { AcademicWork, AcademicPaginationResponse } from '@features/academics/models/academic.model';

describe('HomePageComponent', () => {
  let component: HomePageComponent;
  let fixture: ComponentFixture<HomePageComponent>;
  let reviewsSubject: Subject<ReviewPaginationResponse>;
  let academicsSubject: Subject<AcademicPaginationResponse>;
  let mockReviewService: jasmine.SpyObj<ReviewService>;
  let mockAcademicService: jasmine.SpyObj<AcademicService>;

  const makeReview = (id: string): Review => ({
    id,
    title: `Review ${id}`,
    author: 'Author',
    bookTitle: 'Book',
    bookAuthor: 'Book Author',
    rating: 4,
    genre: 'fiction',
    description: 'A description',
    content: 'Full content',
    publishedAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    createdBy: 'user',
    isPublished: true,
    featured: true,
  });

  const makeAcademic = (id: string): AcademicWork => ({
    id,
    title: `Academic ${id}`,
    summary: 'A summary',
    content: 'Full content',
    workType: 'mémoire',
    context: 'Université',
    year: 2024,
    theme: 'littérature',
    publishedAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    createdBy: 'user',
    isPublished: true,
    featured: true,
  });

  const emptyReviewResponse: ReviewPaginationResponse = {
    data: [],
    total: 0,
    page: 1,
    limit: 3,
    totalPages: 0,
  };

  const emptyAcademicResponse: AcademicPaginationResponse = {
    data: [],
    total: 0,
    page: 1,
    limit: 3,
    totalPages: 0,
  };

  beforeEach(async () => {
    reviewsSubject = new Subject<ReviewPaginationResponse>();
    academicsSubject = new Subject<AcademicPaginationResponse>();

    mockReviewService = jasmine.createSpyObj('ReviewService', ['getReviews']);
    mockReviewService.getReviews.and.returnValue(reviewsSubject.asObservable());

    mockAcademicService = jasmine.createSpyObj('AcademicService', ['getAcademics']);
    mockAcademicService.getAcademics.and.returnValue(academicsSubject.asObservable());

    await TestBed.configureTestingModule({
      imports: [HomePageComponent, RouterTestingModule],
      providers: [
        { provide: ReviewService, useValue: mockReviewService },
        { provide: AcademicService, useValue: mockAcademicService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    reviewsSubject.complete();
    academicsSubject.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getReviews with featured:true and limit:3 on init', () => {
    expect(mockReviewService.getReviews).toHaveBeenCalledWith({ featured: true, limit: 3 });
  });

  it('should call getAcademics with featured:true and limit:3 on init', () => {
    expect(mockAcademicService.getAcademics).toHaveBeenCalledWith({ featured: true, limit: 3 });
  });

  it('should start with reviewsLoading and academicsLoading both true', () => {
    expect(component.reviewsLoading).toBeTrue();
    expect(component.academicsLoading).toBeTrue();
  });

  it('should render 3 review skeleton placeholders while reviews are loading', () => {
    const el = fixture.nativeElement as HTMLElement;
    const skeletons = el.querySelectorAll('app-review-card-skeleton');
    // 3 for reviews + 3 for academics while both loading
    expect(skeletons.length).toBe(6);
  });

  it('should set aria-busy="true" on reviews section while loading', () => {
    const el = fixture.nativeElement as HTMLElement;
    const sections = el.querySelectorAll('[aria-live="polite"]');
    const reviewsSection = sections[0];
    expect(reviewsSection.getAttribute('aria-busy')).toBe('true');
  });

  it('should clear reviewsLoading and display reviews after data arrives', () => {
    const response: ReviewPaginationResponse = {
      data: [makeReview('1'), makeReview('2'), makeReview('3')],
      total: 3,
      page: 1,
      limit: 3,
      totalPages: 1,
    };

    reviewsSubject.next(response);
    fixture.detectChanges();

    expect(component.reviewsLoading).toBeFalse();
    expect(component.featuredReviews.length).toBe(3);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Review 1');
    expect(el.textContent).toContain('Review 2');
    expect(el.textContent).toContain('Review 3');
  });

  it('should clear academicsLoading and display academics after data arrives', () => {
    const response: AcademicPaginationResponse = {
      data: [makeAcademic('a'), makeAcademic('b')],
      total: 2,
      page: 1,
      limit: 3,
      totalPages: 1,
    };

    // Resolve reviews first so academics section is not blocked
    reviewsSubject.next(emptyReviewResponse);
    academicsSubject.next(response);
    fixture.detectChanges();

    expect(component.academicsLoading).toBeFalse();
    expect(component.featuredAcademics.length).toBe(2);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Academic a');
    expect(el.textContent).toContain('Academic b');
  });

  it('should show reviews empty-state message when no featured reviews exist', () => {
    reviewsSubject.next(emptyReviewResponse);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Aucune critique disponible');
  });

  it('should show academics empty-state message when no featured academics exist', () => {
    academicsSubject.next(emptyAcademicResponse);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Aucun travail académique mis en avant');
  });

  it('should set reviewsLoading to false on error', () => {
    reviewsSubject.error(new Error('network error'));
    fixture.detectChanges();

    expect(component.reviewsLoading).toBeFalse();
  });

  it('should set academicsLoading to false on error', () => {
    academicsSubject.error(new Error('network error'));
    fixture.detectChanges();

    expect(component.academicsLoading).toBeFalse();
  });

  it('should track reviews by id', () => {
    const review = makeReview('42');
    expect(component.trackByReviewId(0, review)).toBe('42');
  });

  it('should track academics by id', () => {
    const academic = makeAcademic('99');
    expect(component.trackByAcademicId(0, academic)).toBe('99');
  });

  it('should track skeleton slots by slot value', () => {
    expect(component.trackBySkeletonSlot(0, 0)).toBe(0);
    expect(component.trackBySkeletonSlot(2, 2)).toBe(2);
  });

  it('should render hero section with id="hero-heading"', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('#hero-heading')).toBeTruthy();
  });

  it('should contain CTA links to /reviews and /academics in hero', () => {
    const el = fixture.nativeElement as HTMLElement;
    const reviewsLink = el.querySelector('a[href="/reviews"]');
    const academicsLink = el.querySelector('a[href="/academics"]');
    expect(reviewsLink).toBeTruthy();
    expect(academicsLink).toBeTruthy();
  });

  it('should unsubscribe on destroy (no pending subscriptions)', () => {
    spyOn(component['destroy$'], 'next').and.callThrough();
    spyOn(component['destroy$'], 'complete').and.callThrough();
    component.ngOnDestroy();
    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
  });
});
