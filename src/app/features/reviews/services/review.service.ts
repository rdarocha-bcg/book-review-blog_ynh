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
  private readonly _reviews$ = new BehaviorSubject<Review[]>([]);
  private readonly _selectedReview$ = new BehaviorSubject<Review | null>(null);
  private readonly _loading$ = new BehaviorSubject<boolean>(false);

  /** Current page of reviews. */
  readonly reviews$ = this._reviews$.asObservable();
  /** Currently selected review (detail view). */
  readonly selectedReview$ = this._selectedReview$.asObservable();
  /** Whether an HTTP request is in progress. */
  readonly loading$ = this._loading$.asObservable();

  constructor(private apiService: ApiService) {}

  /**
   * Get all reviews with filters and pagination
   */
  getReviews(filters?: ReviewFilter): Observable<ReviewPaginationResponse> {
    this._loading$.next(true);
    const params = this.buildParams(filters);

    return this.apiService.get<ReviewPaginationResponse>('reviews', { params }).pipe(
      retry(2),
      tap((response) => {
        this._reviews$.next(response.data);
        this._loading$.next(false);
      }),
      catchError((err) => {
        this._loading$.next(false);
        return throwError(() => err);
      })
    );
  }

  getReviewById(id: string): Observable<Review> {
    this._loading$.next(true);

    return this.apiService.get<Review>(`reviews/${id}`).pipe(
      tap((review) => {
        this._selectedReview$.next(review);
        this._loading$.next(false);
      }),
      catchError((err) => {
        this._loading$.next(false);
        return throwError(() => err);
      })
    );
  }

  createReview(review: Partial<Review>): Observable<Review> {
    this._loading$.next(true);

    return this.apiService.post<Review>('reviews', review).pipe(
      tap(() => {
        this._loading$.next(false);
      })
    );
  }

  updateReview(id: string, review: Partial<Review>): Observable<Review> {
    this._loading$.next(true);

    return this.apiService.put<Review>(`reviews/${id}`, review).pipe(
      tap(() => {
        this._loading$.next(false);
      })
    );
  }

  deleteReview(id: string): Observable<void> {
    this._loading$.next(true);

    return this.apiService.delete<void>(`reviews/${id}`).pipe(
      tap(() => {
        this._loading$.next(false);
      })
    );
  }

  /** @deprecated Use the readonly `reviews$` property directly. */
  getReviews$(): Observable<Review[]> {
    return this.reviews$;
  }

  /** @deprecated Use the readonly `selectedReview$` property directly. */
  getSelectedReview$(): Observable<Review | null> {
    return this.selectedReview$;
  }

  /** @deprecated Use the readonly `loading$` property directly. */
  getLoading$(): Observable<boolean> {
    return this.loading$;
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

