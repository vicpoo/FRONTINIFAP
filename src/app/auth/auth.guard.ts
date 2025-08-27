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
    // Verificar si hay token válido (incluyendo expiración)
    if (this.authService.hasValidToken()) {
      const userRole = this.authService.getUserRole();
      const expectedRole = route.data['expectedRole'];
      
      // Si la ruta requiere un rol específico, verificarlo
      if (expectedRole && userRole !== expectedRole) {
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
      
      return true;
    } else {
      // Token inválido o expirado - solo redirigir si es ruta protegida
      // Las rutas públicas como 'nutricionales/:id' no deben redirigir
      this.authService.logout();
      this.router.navigate(['/login']);
      return false;
    }
  }
}