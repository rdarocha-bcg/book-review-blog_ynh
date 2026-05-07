import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, filter, retry, switchMap, take, throwError, timer } from 'rxjs';
import { NotificationService } from '@core/services/notification.service';
import { AuthService } from '@core/services/auth.service';
import { mapHttpError } from '@core/utils/http-error.utils';

const RETRYABLE_STATUS_CODES = [429, 502, 503];
const MAX_RETRY_COUNT = 3;

/**
 * HTTP Error Interceptor
 * - 429 / 502 / 503: retries up to 3× with exponential backoff (H9)
 * - 401: refreshes session once (race-safe via AuthService) then retries; redirects if still unauth (H3)
 * - 403: permission warning toast with sanitized message
 * - 404: silent (handled per-component)
 * - other: error toast with sanitized message
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const notifications = inject(NotificationService);
  const authService = inject(AuthService);

  return next(req).pipe(
    // H9: Retry transient failures with exponential backoff before surfacing them.
    retry({
      count: MAX_RETRY_COUNT,
      delay: (error: unknown, retryCount: number) => {
        if (error instanceof HttpErrorResponse && RETRYABLE_STATUS_CODES.includes(error.status)) {
          return timer(Math.pow(2, retryCount - 1) * 500);
        }
        throw error;
      },
    }),
    catchError((error: HttpErrorResponse) => {
      const message = mapHttpError(error);

      switch (error.status) {
        case 401: {
          // Let the auth endpoint errors propagate to AuthService to avoid
          // an infinite refresh loop (interceptor → refresh → /auth/me → 401 → interceptor...).
          if (req.url.includes('/auth/me')) {
            return throwError(() => error);
          }

          // H3: If a refresh is already in flight, queue this request until it completes.
          if (authService.isRefreshingNow) {
            return authService.refreshing$.pipe(
              filter((isDone) => isDone),
              take(1),
              switchMap(() => next(req)),
            );
          }

          // Start a refresh and retry the original request if the session is restored.
          return authService.refresh().pipe(
            switchMap((state) => {
              if (state.authenticated) {
                return next(req);
              }
              notifications.warning('Session expired — please sign in from the server portal.');
              router.navigate(['/401']);
              return throwError(() => error);
            }),
          );
        }
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
