import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError, retry } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ApiService } from '@core/services/api.service';
import { AcademicWork, AcademicFilter, AcademicPaginationResponse } from '../models/academic.model';

/**
 * Academic Service
 * Handles academic works API operations and state management
 */
@Injectable({
  providedIn: 'root',
})
export class AcademicService {
  private academics$ = new BehaviorSubject<AcademicWork[]>([]);
  private selectedAcademic$ = new BehaviorSubject<AcademicWork | null>(null);
  private loading$ = new BehaviorSubject<boolean>(false);

  constructor(private apiService: ApiService) {}

  /**
   * Get all academic works with filters and pagination
   */
  getAcademics(filters?: AcademicFilter): Observable<AcademicPaginationResponse> {
    this.loading$.next(true);
    const params = this.buildParams(filters);

    return this.apiService.get<AcademicPaginationResponse>('academics', { params }).pipe(
      retry(2),
      tap((response) => {
        this.academics$.next(response.data);
        this.loading$.next(false);
      }),
      catchError((err) => {
        this.loading$.next(false);
        return throwError(() => err);
      })
    );
  }

  /**
   * Fetches a single academic work by id
   */
  getAcademicById(id: string): Observable<AcademicWork> {
    this.loading$.next(true);

    return this.apiService.get<AcademicWork>(`academics/${id}`).pipe(
      tap((academic) => {
        this.selectedAcademic$.next(academic);
        this.loading$.next(false);
      }),
      catchError((err) => {
        this.loading$.next(false);
        return throwError(() => err);
      })
    );
  }

  createAcademic(academic: Partial<AcademicWork>): Observable<AcademicWork> {
    this.loading$.next(true);

    return this.apiService.post<AcademicWork>('academics', academic).pipe(
      tap(() => {
        this.loading$.next(false);
      })
    );
  }

  updateAcademic(id: string, academic: Partial<AcademicWork>): Observable<AcademicWork> {
    this.loading$.next(true);

    return this.apiService.put<AcademicWork>(`academics/${id}`, academic).pipe(
      tap(() => {
        this.loading$.next(false);
      })
    );
  }

  deleteAcademic(id: string): Observable<void> {
    this.loading$.next(true);

    return this.apiService.delete<void>(`academics/${id}`).pipe(
      tap(() => {
        this.loading$.next(false);
      })
    );
  }

  getAcademics$(): Observable<AcademicWork[]> {
    return this.academics$.asObservable();
  }

  getSelectedAcademic$(): Observable<AcademicWork | null> {
    return this.selectedAcademic$.asObservable();
  }

  getLoading$(): Observable<boolean> {
    return this.loading$.asObservable();
  }

  private buildParams(filters?: AcademicFilter): Record<string, string | number | boolean> {
    const params: Record<string, string | number | boolean> = {};

    if (filters) {
      if (filters['workType']) params['workType'] = filters['workType'];
      if (filters['theme']) params['theme'] = filters['theme'];
      if (filters['search']) params['search'] = filters['search'];
      if (filters['page']) params['page'] = filters['page'];
      if (filters['limit']) params['limit'] = filters['limit'];
      if (filters['featured'] === true) params['featured'] = true;
    }

    return params;
  }
}
