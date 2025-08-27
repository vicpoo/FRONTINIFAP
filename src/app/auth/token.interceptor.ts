// token.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { catchError, throwError } from 'rxjs';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // No agregar token a solicitudes de login o rutas públicas
  if (req.url.includes('/login')) {
    return next(req);
  }

  // Verificar si hay token válido para rutas protegidas
  if (!authService.hasValidToken()) {
    // Si la ruta no es pública y no hay token válido, redirigir al login
    if (authService.hasToken()) {
      // Token existe pero está expirado
      authService.logout();
    }
    
    // Permitir que las rutas públicas continúen sin token
    // Solo redirigir al login si es una ruta protegida
    // (El AuthGuard se encargará de las rutas protegidas)
    return next(req);
  }

  // Agregar token a la solicitud para rutas protegidas
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