// side-nav-mapa.component.ts
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-side-nav-mapa',
  templateUrl: './side-nav-mapa.component.html',
  standalone: true,
  imports: [NgFor]
})
export class SideNavMapaComponent implements OnInit {
  municipioId: number = 0;
  
  menuItems = [
    { 
      icon: 'assets/archivos.png', 
      label: 'TODOS LOS RESULTADOS', 
      route: 'mapa/todos-resultados',
      requiresMunicipioId: false
    },
    { 
      icon: 'assets/Clasificacion.png', 
      label: 'ESTADÍSTICAS Y CLASIFICACIONES', 
      route: 'analisis',
      requiresMunicipioId: true
    },
    { 
      icon: 'assets/recomendaciones.png', 
      label: 'NUTRICIÓN', 
      route: 'nutricionales',
      requiresMunicipioId: true
    },
    { 
      icon: 'assets/salir.png', 
      label: 'REGRESAR', 
      route: '',
      requiresMunicipioId: false
    }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Obtener el ID del municipio de la ruta actual
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.municipioId = +params['id'];
      }
    });
  }

  handleItemClick(item: any) {
    let finalRoute = item.route;
    
    // Si la ruta requiere el ID del municipio, lo agregamos
    if (item.requiresMunicipioId && this.municipioId) {
      finalRoute = `${item.route}/${this.municipioId}`;
    }
    
    this.router.navigate([finalRoute]);
  }
}