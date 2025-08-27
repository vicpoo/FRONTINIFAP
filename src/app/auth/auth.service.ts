// auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  exp: number;
  iat: number;
  // Agrega otras propiedades que tenga tu token
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'authToken';
  private userKey = 'userData';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  
  constructor() {
    // Limpiar tokens expirados al inicializar
    this.cleanupExpiredTokens();
    
    // Verificar expiración del token periódicamente
    this.checkTokenExpirationPeriodically();
  }

  // Limpiar tokens expirados al inicializar
  private cleanupExpiredTokens(): void {
    if (this.hasToken() && this.isTokenExpired()) {
      console.log('🔴 Token expirado encontrado, limpiando...');
      this.clearSessionData();
    }
  }

  // Verificar expiración del token cada minuto
  private checkTokenExpirationPeriodically(): void {
    setInterval(() => {
      if (this.hasToken() && this.isTokenExpired()) {
        this.logout();
      }
    }, 60000); // Verificar cada minuto
  }

  // Guardar token y datos de usuario
  setAuthData(token: string, user: any): void {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.isAuthenticatedSubject.next(true);
  }

  // Obtener token
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Obtener datos de usuario
  getUser(): any {
    const userStr = localStorage.getItem(this.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  // Verificar si hay token
  hasToken(): boolean {
    return !!this.getToken();
  }

  // Verificar si el token es válido (existe y no está expirado)
  hasValidToken(): boolean {
    return this.hasToken() && !this.isTokenExpired();
  }

  // Verificar si el token está expirado
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const decoded: DecodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  // Verificar si el usuario está autenticado
  isAuthenticated(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  // Cerrar sesión
  logout(): void {
    this.clearSessionData();
    this.isAuthenticatedSubject.next(false);
  }

  // Limpiar datos de sesión
  private clearSessionData(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  // Obtener rol del usuario
  getUserRole(): number | null {
    const user = this.getUser();
    return user ? user.rol_id : null;
  }

  // Obtener ID del usuario
  getUserId(): number | null {
    const user = this.getUser();
    return user ? user.id : null;
  }
}