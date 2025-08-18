import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms'; 

@Component({
  selector: 'app-login',
   standalone: true,
  imports: [CommonModule, FormsModule ],
  templateUrl: './Login.component.html',
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  login() {
    // Aquí puedes conectar con tu servicio de autenticación
    console.log('Email:', this.email);
    console.log('Password:', this.password);
  }
}
