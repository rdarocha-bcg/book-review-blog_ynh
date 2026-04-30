import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '@core/services/notification.service';
import { mapHttpError } from '@core/utils/http-error.utils';

/**
 * HTTP Error Interceptor
 * Handles HTTP errors globally with sanitized, user-friendly messages.
 * Raw server error details (stack traces, SQL errors, etc.) are never exposed.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const notifications = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const message = mapHttpError(error);

      switch (error.status) {
        case 401:
          notifications.warning(message);
          router.navigate(['/401']);
          break;
        case 403:
          notifications.warning(message);
          break;
        case 404:
          // 404s are handled per-component; no global toast needed
          break;
        default:
          notifications.error(message);
          break;
      }

      return throwError(() => error);
    }),
  );
};
