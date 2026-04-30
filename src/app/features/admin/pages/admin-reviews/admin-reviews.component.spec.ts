import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { AdminReviewsComponent } from './admin-reviews.component';
import { ReviewService } from '@features/reviews/services/review.service';
import { NotificationService } from '@core/services/notification.service';
import { Review, ReviewPaginationResponse } from '@features/reviews/models/review.model';

const mockReview: Review = {
  id: 'r1',
  title: 'Test Book',
  author: 'Author',
  bookTitle: 'Test Book',
  bookAuthor: 'Book Author',
  rating: 4,
  genre: 'fiction',
  description: 'Desc',
  content: 'Content',
  publishedAt: new Date(),
  updatedAt: new Date(),
  createdBy: 'u1',
  isPublished: true,
};

const mockResponse: ReviewPaginationResponse = {
  data: [mockReview],
  total: 1,
  page: 1,
  limit: 100,
  totalPages: 1,
};

describe('AdminReviewsComponent', () => {
  let component: AdminReviewsComponent;
  let fixture: ComponentFixture<AdminReviewsComponent>;
  let reviewService: jasmine.SpyObj<ReviewService>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let router: Router;

  beforeEach(async () => {
    reviewService = jasmine.createSpyObj('ReviewService', ['getReviews', 'deleteReview']);
    notificationService = jasmine.createSpyObj('NotificationService', ['success', 'error', 'warning']);

    reviewService.getReviews.and.returnValue(of(mockResponse));
    reviewService.deleteReview.and.returnValue(of(undefined));

    await TestBed.configureTestingModule({
      imports: [AdminReviewsComponent, RouterTestingModule],
      providers: [
        { provide: ReviewService, useValue: reviewService },
        { provide: NotificationService, useValue: notificationService },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(AdminReviewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load reviews on init', () => {
    expect(reviewService.getReviews).toHaveBeenCalled();
    expect(component.reviews).toEqual([mockReview]);
    expect(component.loading).toBeFalse();
  });

  it('should show error notification when loading fails', fakeAsync(() => {
    reviewService.getReviews.and.returnValue(throwError(() => new Error('fail')));
    component.loadReviews();
    tick();
    expect(notificationService.error).toHaveBeenCalledWith('Impossible de charger les critiques.');
    expect(component.loading).toBeFalse();
  }));

  describe('deleteReview', () => {
    it('should call deleteReview and show success when confirmed', fakeAsync(() => {
      spyOn(window, 'confirm').and.returnValue(true);
      const navigateSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

      component.deleteReview(mockReview);
      tick();

      expect(reviewService.deleteReview).toHaveBeenCalledWith('r1');
      expect(notificationService.success).toHaveBeenCalledWith('Critique supprimée.');
      expect(navigateSpy).toHaveBeenCalledWith(['/admin/reviews']);
    }));

    it('should not call deleteReview when user cancels confirm', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      component.deleteReview(mockReview);
      expect(reviewService.deleteReview).not.toHaveBeenCalled();
    });

    it('should show error notification when deleteReview fails', fakeAsync(() => {
      spyOn(window, 'confirm').and.returnValue(true);
      reviewService.deleteReview.and.returnValue(throwError(() => new Error('fail')));

      component.deleteReview(mockReview);
      tick();

      expect(notificationService.error).toHaveBeenCalledWith('Impossible de supprimer la critique.');
    }));
  });
});
