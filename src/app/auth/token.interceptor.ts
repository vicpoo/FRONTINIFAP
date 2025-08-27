// token.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { catchError, throwError } from 'rxjs';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // No agregar token a solicitudes de login
  if (req.url.includes('/login')) {
    return next(req);
  }

  // Verificar si hay token válido
  if (!authService.hasValidToken()) {
    if (authService.hasToken()) {
      // Token existe pero está expirado
      authService.logout();
    }
    router.navigate(['/login']);
    return throwError(() => new Error('No autenticado'));
  }

  // Agregar token a la solicitud
  const token = authService.getToken();
  const clonedRequest = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(clonedRequest).pipe(
    catchError((error) => {
      if (error.status === 401) {
        authService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};