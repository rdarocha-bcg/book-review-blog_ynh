import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '@core/services/notification.service';
import { AuthService } from '@core/services/auth.service';

/**
 * HTTP Error Interceptor
 * Handles HTTP errors globally (no in-app login flow; auth is outside this UI).
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const notifications = inject(NotificationService);
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 401:
          auth.refresh();
          notifications.warning('Votre session a expiré. Veuillez vous reconnecter.');
          router.navigate(['/401']);
          break;
        case 403:
          notifications.warning('You do not have permission to perform this action.');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          notifications.error('A server error occurred. Please try again later.');
          break;
      }
      return throwError(() => error);
    }),
  );
};
