import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

/**
 * HTTP Error Interceptor
 * Handles HTTP errors globally (no in-app login flow; auth is outside this UI).
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        console.error('Unauthorized request');
      }
      if (error.status === 403) {
        console.error('Access denied');
      }
      if (error.status === 404) {
        console.error('Resource not found');
      }
      if (error.status === 500) {
        console.error('Server error occurred');
      }
      console.error('HTTP Error:', error);
      return throwError(() => error);
    }),
  );
};
