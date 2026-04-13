import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '@core/services/notification.service';

/**
 * HTTP Error Interceptor
 * Handles HTTP errors globally (no in-app login flow; auth is outside this UI).
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const notifications = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        notifications.warning('Session expired — please sign in from the server portal.');
        router.navigate(['/401']);
      }
      if (error.status === 403) {
        notifications.warning('You do not have permission to perform this action.');
      }
      if (error.status === 404) {
        console.error('Resource not found');
      }
      if (error.status === 500) {
        notifications.error('A server error occurred. Please try again later.');
      }
      return throwError(() => error);
    }),
  );
};
