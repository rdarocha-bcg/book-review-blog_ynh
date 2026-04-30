import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { provideMarkdown } from 'ngx-markdown';
import { ReviewDetailComponent } from './review-detail.component';
import { ReviewService } from '../../services/review.service';
import { AuthService } from '@core/services/auth.service';

describe('ReviewDetailComponent', () => {
  let component: ReviewDetailComponent;
  let fixture: ComponentFixture<ReviewDetailComponent>;
  let reviewService: jasmine.SpyObj<ReviewService>;
  let authService: jasmine.SpyObj<AuthService>;

  const mockReview = {
    id: '1',
    title: 'Test Review',
    author: 'Author',
    bookTitle: 'Book',
    bookAuthor: 'BA',
    rating: 5,
    genre: 'fiction',
    description: 'Desc',
    content: 'Content',
    publishedAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'u1',
    isPublished: true,
  };

  beforeEach(async () => {
    reviewService = jasmine.createSpyObj('ReviewService', ['getReviewById'], {
      getSelectedReview$: () => of(mockReview),
      getLoading$: () => of(false),
    });
    reviewService.getReviewById.and.returnValue(of(mockReview));

    authService = jasmine.createSpyObj('AuthService', ['isAdmin']);
    authService.isAdmin.and.returnValue(false);

    await TestBed.configureTestingModule({
      imports: [ReviewDetailComponent, RouterTestingModule],
      providers: [
        { provide: ReviewService, useValue: reviewService },
        { provide: ActivatedRoute, useValue: { params: of({ id: '1' }) } },
        { provide: AuthService, useValue: authService },
        provideMarkdown(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getReviewById with route param', () => {
    expect(reviewService.getReviewById).toHaveBeenCalledWith('1');
  });

  it('should display review title when review is loaded', () => {
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Test Review');
    expect(el.textContent).toContain('Book');
  });

  it('should show edit button when user is admin', () => {
    authService.isAdmin.and.returnValue(true);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const editLink = el.querySelector('a[href*="/reviews/1/edit"]') as HTMLAnchorElement | null;
    expect(editLink).toBeTruthy();
    expect(editLink?.textContent).toContain('Modifier');
  });

  it('should hide edit button when user is not admin', () => {
    authService.isAdmin.and.returnValue(false);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const editLink = el.querySelector('a[href*="/reviews/1/edit"]');
    expect(editLink).toBeNull();
  });
});
