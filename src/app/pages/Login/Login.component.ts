//Login.component.ts
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UsuariosService, LoginRequest } from '../../Service/Usuarios.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './Login.component.html',
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private usuariosService: UsuariosService,
    private router: Router
  ) {}

  login() {
    if (!this.email || !this.password) {
      this.errorMessage = '⚠️ Por favor, complete todos los campos';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const loginData: LoginRequest = {
      correo: this.email,
      password: this.password
    };

    this.usuariosService.login(loginData).subscribe({
      next: (response) => {
        console.log('✅ Login exitoso:', response);
        
        // Guardar el token en localStorage
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify({
          id: response.id_user,
          nombre: response.nombre,
          apellido: response.apellido,
          correo: response.correo,
          rol_id: response.rol_id_FK
        }));

        this.isLoading = false;
        
        // Redirigir según el rol
        if (response.rol_id_FK === 1) {
          this.router.navigate(['/admin']);
        } else if (response.rol_id_FK === 2) {
          this.router.navigate(['/Usuario']);
        } else {
          this.errorMessage = '⚠️ Rol desconocido, contacte al administrador';
        }
      },
      error: (error) => {
        console.error('❌ Error en login:', error);
        this.isLoading = false;
        
        if (error.status === 401) {
          this.errorMessage = 'Credenciales inválidas';
        } else if (error.status === 404) {
          this.errorMessage = 'Usuario no encontrado';
        } else {
          this.errorMessage = 'Error en el servidor. Intente más tarde.';
        }
      }
    });
  }

  goToHome() {
    this.router.navigate(['/']);
  }
}
