import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError, retry } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ApiService } from '@core/services/api.service';
import { Review, ReviewFilter, ReviewPaginationResponse } from '../models/review.model';

/**
 * Review Service
 * Handles review API operations and state management
 */
@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private reviews$ = new BehaviorSubject<Review[]>([]);
  private selectedReview$ = new BehaviorSubject<Review | null>(null);
  private loading$ = new BehaviorSubject<boolean>(false);

  constructor(private apiService: ApiService) {}

  /**
   * Get all reviews with filters and pagination
   */
  getReviews(filters?: ReviewFilter): Observable<ReviewPaginationResponse> {
    this.loading$.next(true);
    const params = this.buildParams(filters);

    return this.apiService.get<ReviewPaginationResponse>('reviews', { params }).pipe(
      retry(2),
      tap((response) => {
        this.reviews$.next(response.data);
        this.loading$.next(false);
      }),
      catchError((err) => {
        this.loading$.next(false);
        return throwError(() => err);
      })
    );
  }

  /**
   * Fetches a single review by id. Updates selectedReview$ and loading$ state.
   * @param id - Review id
   * @returns Observable of the review, or errors if not found
   */
  getReviewById(id: string): Observable<Review> {
    this.loading$.next(true);

    return this.apiService.get<Review>(`reviews/${id}`).pipe(
      tap((review) => {
        this.selectedReview$.next(review);
        this.loading$.next(false);
      }),
      catchError((err) => {
        this.loading$.next(false);
        return throwError(() => err);
      })
    );
  }

  /**
   * Create new review
   */
  createReview(review: Partial<Review>): Observable<Review> {
    this.loading$.next(true);

    return this.apiService.post<Review>('reviews', review).pipe(
      tap(() => {
        this.loading$.next(false);
      })
    );
  }

  /**
   * Update review
   */
  updateReview(id: string, review: Partial<Review>): Observable<Review> {
    this.loading$.next(true);

    return this.apiService.put<Review>(`reviews/${id}`, review).pipe(
      tap(() => {
        this.loading$.next(false);
      })
    );
  }

  /**
   * Delete review
   */
  deleteReview(id: string): Observable<void> {
    this.loading$.next(true);

    return this.apiService.delete<void>(`reviews/${id}`).pipe(
      tap(() => {
        this.loading$.next(false);
      })
    );
  }

  /**
   * Get reviews as Observable
   */
  getReviews$(): Observable<Review[]> {
    return this.reviews$.asObservable();
  }

  /**
   * Get selected review as Observable
   */
  getSelectedReview$(): Observable<Review | null> {
    return this.selectedReview$.asObservable();
  }

  /**
   * Get loading state
   */
  getLoading$(): Observable<boolean> {
    return this.loading$.asObservable();
  }

  /**
   * Build query parameters from filters
   */
  private buildParams(filters?: ReviewFilter): Record<string, string | number | boolean> {
    const params: Record<string, string | number | boolean> = {};

    if (filters) {
      if (filters['genre']) params['genre'] = filters['genre'];
      if (filters['rating']) params['rating'] = filters['rating'];
      if (filters['search']) params['search'] = filters['search'];
      if (filters['author']) params['author'] = filters['author'];
      if (filters['sort']) params['sort'] = filters['sort'];
      if (filters['page']) params['page'] = filters['page'];
      if (filters['limit']) params['limit'] = filters['limit'];
      if (filters['featured'] === true) params['featured'] = true;
    }

    return params;
  }
}

