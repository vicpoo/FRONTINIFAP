// auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';

interface DecodedToken {
  exp: number;
  iat: number;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'authToken';
  private userKey = 'userData';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  
  constructor(private router: Router) {
    console.log('AuthService - Inicializando, token válido:', this.hasValidToken());
    this.checkTokenOnInit();
    this.checkTokenExpirationPeriodically();
  }

  private checkTokenOnInit(): void {
    if (this.hasToken() && this.isTokenExpired()) {
      console.log('AuthService - Token expirado encontrado al inicializar');
      this.clearSessionData();
      this.isAuthenticatedSubject.next(false);
    }
  }

  private checkTokenExpirationPeriodically(): void {
    setInterval(() => {
      if (this.hasToken() && this.isTokenExpired()) {
        console.log('AuthService - Token expirado, cerrando sesión');
        this.logout();
      }
    }, 60000);
  }

  setAuthData(token: string, user: any): void {
    console.log('AuthService - Guardando datos de autenticación');
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.isAuthenticatedSubject.next(true);
  }

  getToken(): string | null {
    const token = localStorage.getItem(this.tokenKey);
    return token;
  }

  getUser(): any {
    const userStr = localStorage.getItem(this.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  hasToken(): boolean {
    return !!this.getToken();
  }

  hasValidToken(): boolean {
    const hasValid = this.hasToken() && !this.isTokenExpired();
    console.log('AuthService - Token válido:', hasValid);
    return hasValid;
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) {
      return true;
    }

    try {
      const decoded: DecodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  isAuthenticated(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  get isAuthenticatedSync(): boolean {
    return this.hasValidToken();
  }

  logout(): void {
    console.log('AuthService - Cerrando sesión');
    this.clearSessionData();
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  private clearSessionData(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  getUserRole(): number | null {
    const user = this.getUser();
    return user ? user.rol_id : null;
  }

  getUserId(): number | null {
    const user = this.getUser();
    return user ? user.id : null;
  }

  getUserName(): string | null {
    const user = this.getUser();
    return user ? user.name : null;
  }
}