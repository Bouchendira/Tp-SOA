import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { catchError, throwError } from 'rxjs';
import { TOKEN_STORAGE_KEY } from './auth.service';
import { getApiErrorMessage } from './api-error';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  const token = isBrowser ? localStorage.getItem(TOKEN_STORAGE_KEY) : null;

  if (!token || !request.url.startsWith('/api/') || request.url === '/api/auth/login') {
    return next(request);
  }

  return next(request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};

export const apiErrorInterceptor: HttpInterceptorFn = (request, next) =>
  next(request).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse)) {
        return throwError(() => error);
      }

      return throwError(() => new Error(getApiErrorMessage(error)));
    })
  );
