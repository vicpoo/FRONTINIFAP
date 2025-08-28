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
      nombre: 'Victor Alejandro Hernández Pérez',
      rol: 'Full Stack Developer, Lider de equipo',
      descripcion: 'Encargado de coordinar el equipo, desarrollo tanto en frontend como backend, con especialidad en Angular e integración de interfaces.'
    },
    {
      nombre: 'Katherine Romina Espinoza Barrionuevo',
      rol: 'UI/UX Designer, Analista de calidad',
      descripcion: 'Responsable de la experiencia de usuario y las pruebas de calidad, asegurando interfaces intuitivas y usabilidad.'
    },
    {
      nombre: 'Denzel Enrique Santiago Zepeda',
      rol: 'Frontend Developer, UI/UX Designer',
      descripcion: 'Especialista en Angular y diseño de interfaces, encargado de la integración y despliegue en el entorno frontend.'
    },
    {
      nombre: 'Edwin de jesus Diaz Garcia',
      rol: 'Backend Developer',
      descripcion: 'Responsable del desarrollo y mantenimiento de la lógica del servidor, integración de APIs y gestión de bases de datos.'
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