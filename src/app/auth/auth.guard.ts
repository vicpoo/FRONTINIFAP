// auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(private authService: AuthService, private router: Router) {}
  
  canActivate(route: ActivatedRouteSnapshot): boolean {
    const currentPath = route.routeConfig?.path;
    
    console.log('AuthGuard - Ruta actual:', currentPath);
    
    // Lista de rutas públicas que no requieren autenticación
    const publicRoutes = ['', 'login', 'nutricionales/:id'];
    
    // Verificar si es una ruta pública
    const isPublicRoute = publicRoutes.some(publicRoute => {
      // Para rutas con parámetros como 'nutricionales/:id'
      if (publicRoute.includes(':')) {
        const baseRoute = publicRoute.split('/:')[0];
        return currentPath?.startsWith(baseRoute + '/') || currentPath === baseRoute;
      }
      return publicRoute === currentPath;
    });
    
    if (isPublicRoute) {
      console.log('AuthGuard - Ruta pública, acceso permitido sin autenticación');
      return true;
    }

    // Para rutas protegidas, verificar autenticación
    if (this.authService.hasValidToken()) {
      console.log('AuthGuard - Token válido encontrado');
      const userRole = this.authService.getUserRole();
      const expectedRole = route.data['expectedRole'];
      
      // Si la ruta requiere un rol específico, verificarlo
      if (expectedRole && userRole !== expectedRole) {
        console.log('AuthGuard - Rol no autorizado. Usuario:', userRole, 'Esperado:', expectedRole);
        // Redirigir según el rol del usuario
        if (userRole === 1) {
          this.router.navigate(['/admin']);
        } else if (userRole === 2) {
          this.router.navigate(['/Usuario']);
        } else {
          this.router.navigate(['/']);
        }
        return false;
      }
      
      console.log('AuthGuard - Acceso autorizado');
      return true;
    } else {
      // Token inválido o expirado - redirigir al login
      console.log('AuthGuard - Token inválido, redirigiendo a login');
      this.router.navigate(['/login']);
      return false;
    }
  }
}