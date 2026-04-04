import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { ReviewDetailComponent } from './review-detail.component';
import { ReviewService } from '../../services/review.service';

describe('ReviewDetailComponent', () => {
  let component: ReviewDetailComponent;
  let fixture: ComponentFixture<ReviewDetailComponent>;
  let reviewService: jasmine.SpyObj<ReviewService>;

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

    await TestBed.configureTestingModule({
      imports: [ReviewDetailComponent, RouterTestingModule],
      providers: [
        { provide: ReviewService, useValue: reviewService },
        { provide: ActivatedRoute, useValue: { params: of({ id: '1' }) } },
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
});
