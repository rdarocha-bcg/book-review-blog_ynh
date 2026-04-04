import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Auth Interceptor — placeholder. SSO auth uses cookies + withCredentials; no Bearer JWT.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => next(req);
