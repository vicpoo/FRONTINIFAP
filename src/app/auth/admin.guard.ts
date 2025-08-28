// admin.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  
  constructor(private authService: AuthService, private router: Router) {}
  
  canActivate(): boolean {
    if (this.authService.hasValidToken()) {
      const userRole = this.authService.getUserRole();
      
      if (userRole === 1) {
        return true;
      } else {
        if (userRole === 2) {
          this.router.navigate(['/Usuario']);
        } else {
          this.router.navigate(['/']);
        }
        return false;
      }
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}