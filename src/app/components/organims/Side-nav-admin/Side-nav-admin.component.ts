// Side-nav-admin.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-side-nav-admin',
  templateUrl: './side-nav-admin.component.html',
  standalone: true,
  imports: [NgFor]
})
export class SideNavAdminComponent {
  menuItems = [
    { icon: 'assets/subirArchivo.png', label: 'GESTION DE ARCHIVOS' },
    { icon: 'assets/usuarios.png', label: 'LISTA DE USUARIOS' },
    { icon: 'assets/recomendaciones.png', label: 'RECOMENDACIONES NUTRICIONALES' },
    { icon: 'assets/salir.png', label: 'REGRESAR' }
  ];

  constructor(private router: Router) {}

  handleItemClick(item: any) {
    switch (item.label) {
      case 'REGRESAR':
        this.router.navigate(['']);
        break;
      case 'GESTION DE ARCHIVOS':
        this.router.navigate(['admin/Gestion-Archivos']);
        break;
      case 'LISTA DE USUARIOS':
        this.router.navigate(['admin/lista-usuarios']);
        break;
      case 'RECOMENDACIONES NUTRICIONALES':
        this.router.navigate(['admin/Recomendaciones']);
        break;
    }
  }
}
