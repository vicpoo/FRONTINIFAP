// main.ts
import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { tokenInterceptor } from './app/auth/token.interceptor';

// Limpiar localStorage al iniciar la aplicación (solo en desarrollo)
if (!window.location.href.includes('localhost') && !window.location.href.includes('127.0.0.1')) {
  // En producción, limpiar solo tokens expirados
  const authToken = localStorage.getItem('authToken');
  if (authToken) {
    try {
      const tokenData = JSON.parse(atob(authToken.split('.')[1]));
      const isExpired = tokenData.exp * 1000 < Date.now();
      if (isExpired) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      }
    } catch (e) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
    }
  }
} else {
  // En desarrollo, opcionalmente limpiar todo (descomenta si necesitas)
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
}

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptors([tokenInterceptor])),
    provideRouter(routes),
  ],
}).catch(err => console.error(err));