import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-portada',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './Portada.component.html',
})
export class PortadaComponent {
  constructor(private router: Router) {}

  // Información de los desarrolladores
  desarrolladores = [
    {
      nombre: 'Desarrollador 1',
      rol: 'Frontend Developer',
      imagen: 'assets/desarrollador1.jpg',
      descripcion: 'Especialista en Angular y diseño de interfaces'
    },
    {
      nombre: 'Desarrollador 2',
      rol: 'Backend Developer',
      imagen: 'assets/desarrollador2.jpg',
      descripcion: 'Experto en APIs y bases de datos'
    },
    {
      nombre: 'Desarrollador 3',
      rol: 'Full Stack Developer',
      imagen: 'assets/desarrollador3.jpg',
      descripcion: 'Encargado de la integración y despliegue'
    },
    {
      nombre: 'Desarrollador 4',
      rol: 'UI/UX Designer',
      imagen: 'assets/desarrollador4.jpg',
      descripcion: 'Diseñador de experiencias de usuario'
    }
  ];

  // Función para navegar al home
  goToHome() {
    this.router.navigate(['/home']);
  }

  // Función para descargar manual
  downloadManual() {
    // Aquí va la lógica para descargar el manual
    const link = document.createElement('a');
    link.href = 'assets/manual-usuario.pdf';
    link.download = 'manual-usuario.pdf';
    link.click();
  }
}