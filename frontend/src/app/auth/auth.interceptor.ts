import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const isApiRequest = request.url.startsWith(environment.apiUrl);

  if (isApiRequest && authService.isAuthenticated) {
    const authorizedRequest = request.clone({
      setHeaders: { Authorization: `Bearer ${authService.accessToken}` }
    });
    return next(authorizedRequest);
  }

  return next(request);
};