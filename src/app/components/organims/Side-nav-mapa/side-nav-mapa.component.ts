// side-nav-mapa.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-side-nav-mapa',
  templateUrl: './side-nav-mapa.component.html',
  standalone: true,
  imports: [NgFor]
})
export class SideNavMapaComponent {
  menuItems = [
    { icon: 'assets/subirArchivo.png', label: 'TODOS LOS RESULTADOS', route: 'mapa/todos-resultados' },
    { icon: 'assets/estadisticas.png', label: 'ESTADÍSTICAS Y CLASIFICACIONES', route: 'analisis/:id' },
    { icon: 'assets/recomendaciones.png', label: 'NUTRICIÓN', route: 'recomendaciones/:id' },
    { icon: 'assets/salir.png', label: 'REGRESAR', route: '' }
  ];

  constructor(private router: Router) {}

  handleItemClick(item: any) {
    this.router.navigate([item.route]);
  }
}