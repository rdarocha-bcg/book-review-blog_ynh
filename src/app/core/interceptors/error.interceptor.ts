import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

/**
 * HTTP Error Interceptor
 * Handles HTTP errors globally
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized
      if (error.status === 401) {
        router.navigate(['/auth/login']);
        console.error('Unauthorized: Please login');
      }

      // Handle 403 Forbidden
      if (error.status === 403) {
        console.error('Access denied');
      }

      // Handle 404 Not Found
      if (error.status === 404) {
        console.error('Resource not found');
      }

      // Handle 500 Server Error
      if (error.status === 500) {
        console.error('Server error occurred');
      }

      // Log error
      console.error('HTTP Error:', error);

      return throwError(() => error);
    })
  );
};

