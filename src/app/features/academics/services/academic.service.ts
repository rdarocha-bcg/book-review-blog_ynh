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
  private readonly _academics$ = new BehaviorSubject<AcademicWork[]>([]);
  private readonly _selectedAcademic$ = new BehaviorSubject<AcademicWork | null>(null);
  private readonly _loading$ = new BehaviorSubject<boolean>(false);

  /** Current page of academic works. */
  readonly academics$ = this._academics$.asObservable();
  /** Currently selected academic work (detail view). */
  readonly selectedAcademic$ = this._selectedAcademic$.asObservable();
  /** Whether an HTTP request is in progress. */
  readonly loading$ = this._loading$.asObservable();

  constructor(private apiService: ApiService) {}

  getAcademics(filters?: AcademicFilter): Observable<AcademicPaginationResponse> {
    this._loading$.next(true);
    const params = this.buildParams(filters);

    return this.apiService.get<AcademicPaginationResponse>('academics', { params }).pipe(
      retry(2),
      tap((response) => {
        this._academics$.next(response.data);
        this._loading$.next(false);
      }),
      catchError((err) => {
        this._loading$.next(false);
        return throwError(() => err);
      })
    );
  }

  getAcademicById(id: string): Observable<AcademicWork> {
    this._loading$.next(true);

    return this.apiService.get<AcademicWork>(`academics/${id}`).pipe(
      tap((academic) => {
        this._selectedAcademic$.next(academic);
        this._loading$.next(false);
      }),
      catchError((err) => {
        this._loading$.next(false);
        return throwError(() => err);
      })
    );
  }

  createAcademic(academic: Partial<AcademicWork>): Observable<AcademicWork> {
    this._loading$.next(true);

    return this.apiService.post<AcademicWork>('academics', academic).pipe(
      tap(() => {
        this._loading$.next(false);
      })
    );
  }

  updateAcademic(id: string, academic: Partial<AcademicWork>): Observable<AcademicWork> {
    this._loading$.next(true);

    return this.apiService.put<AcademicWork>(`academics/${id}`, academic).pipe(
      tap(() => {
        this._loading$.next(false);
      })
    );
  }

  deleteAcademic(id: string): Observable<void> {
    this._loading$.next(true);

    return this.apiService.delete<void>(`academics/${id}`).pipe(
      tap(() => {
        this._loading$.next(false);
      })
    );
  }

  /** @deprecated Use the readonly `academics$` property directly. */
  getAcademics$(): Observable<AcademicWork[]> {
    return this.academics$;
  }

  /** @deprecated Use the readonly `selectedAcademic$` property directly. */
  getSelectedAcademic$(): Observable<AcademicWork | null> {
    return this.selectedAcademic$;
  }

  /** @deprecated Use the readonly `loading$` property directly. */
  getLoading$(): Observable<boolean> {
    return this.loading$;
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
