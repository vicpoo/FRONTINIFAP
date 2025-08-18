import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { SideNavService } from '../../../Service/Side-nav.service';

@Component({
  selector: 'app-side-nav-admin',
  templateUrl: './side-nav-admin.component.html',
  standalone: true,
  imports: [NgFor, NgIf]
})
export class SideNavAdminComponent implements OnInit, OnDestroy {
  menuItems = [
    { icon: 'assets/archivos.png', label: 'Gestion-Archivos' },
    { icon: 'assets/usuarios.png', label: 'Lista-Usuarios' },
    { icon: 'assets/recomendaciones.png', label: 'Recomendaciones' },
    { icon: 'assets/salir.png', label: 'Salir' }
  ];

  isMobile: boolean = false;
  isDrawerOpen: boolean = false;
  private resizeListener: any;

  constructor(
    private router: Router,
    public sideNavService: SideNavService
  ) {}

  ngOnInit() {
    this.checkIfMobile();
    this.resizeListener = () => this.checkIfMobile();
    window.addEventListener('resize', this.resizeListener);
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.resizeListener);
  }

  checkIfMobile() {
    this.isMobile = window.innerWidth < 640;
  }

  toggleNav() {
    this.sideNavService.toggle();
  }

  get isExpanded() {
    return this.sideNavService.getExpanded();
  }

  toggleDrawer() {
    this.isDrawerOpen = !this.isDrawerOpen;
  }

  handleItemClick(item: any) {
    switch (item.label) {
      case 'Salir':
        this.router.navigate(['']);
        break;
      case 'Gestion-Archivos':
        this.router.navigate(['']);
        break;
      case 'Lista-Usuarios':
        this.router.navigate(['/Lista-Usuarios']);
        break;
      case 'Recomendaciones':
        this.router.navigate(['']);
        break;
      
    }
  }
}
