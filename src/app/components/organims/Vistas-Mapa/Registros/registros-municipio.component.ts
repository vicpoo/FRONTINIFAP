// registros-municipio.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AnalisisSuelosService, RegistrosMunicipio } from '../../../../Service/analisis-suelos.service';
import { SideNavMapaComponent } from '../../Side-nav-mapa/side-nav-mapa.component';

@Component({
  selector: 'app-registros-municipio',
  standalone: true,
  imports: [CommonModule, HttpClientModule, SideNavMapaComponent],
  templateUrl: './registros-municipio.component.html',
})
export class RegistrosMunicipioComponent implements OnInit {
  municipioId: number = 0;
  municipioNombre: string = 'Cargando...';
  registros: RegistrosMunicipio | null = null;
  cargando: boolean = true;
  error: string = '';
  
  // Variables para ordenamiento y paginación
  columnas: string[] = [];
  columnaOrdenada: string = '';
  ordenAscendente: boolean = true;
  registrosOrdenados: any[] = [];
  paginaActual: number = 1;
  registrosPorPagina: number = 10;
  totalPaginas: number = 1;
  indiceInicio: number = 0;
  indiceFin: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private analisisService: AnalisisSuelosService
  ) {}

  ngOnInit(): void {
    // Obtener el ID del municipio de la ruta
    this.municipioId = +this.route.snapshot.paramMap.get('id')!;
    
    // Obtener el nombre del municipio del sessionStorage
    const nombreGuardado = sessionStorage.getItem('municipioNombre');
    if (nombreGuardado) {
      this.municipioNombre = nombreGuardado;
    } else {
      this.municipioNombre = `Municipio ID: ${this.municipioId}`;
    }
    
    // Cargar los registros
    this.cargarRegistros();
  }

  private cargarRegistros(): void {
    this.cargando = true;
    this.error = '';
    
    this.analisisService.getRegistrosPorId(this.municipioId).subscribe({
      next: (registros: RegistrosMunicipio) => {
        this.registros = registros;
        
        // Extraer las columnas de los registros (si hay registros)
        if (registros.registros && registros.registros.length > 0) {
          this.columnas = Object.keys(registros.registros[0]);
          this.registrosOrdenados = [...registros.registros];
        }
        
        this.calcularPaginacion();
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error cargando registros:', error);
        this.error = 'Error al cargar los registros de análisis del suelo';
        this.cargando = false;
      }
    });
  }

  // Métodos para ordenamiento
  ordenarPor(columna: string): void {
    if (this.columnaOrdenada === columna) {
      this.ordenAscendente = !this.ordenAscendente;
    } else {
      this.columnaOrdenada = columna;
      this.ordenAscendente = true;
    }
    
    this.registrosOrdenados.sort((a, b) => {
      const valorA = a[columna];
      const valorB = b[columna];
      
      if (valorA === null || valorA === undefined) return this.ordenAscendente ? 1 : -1;
      if (valorB === null || valorB === undefined) return this.ordenAscendente ? -1 : 1;
      
      if (typeof valorA === 'string' && typeof valorB === 'string') {
        return this.ordenAscendente 
          ? valorA.localeCompare(valorB) 
          : valorB.localeCompare(valorA);
      }
      
      return this.ordenAscendente 
        ? (valorA > valorB ? 1 : -1) 
        : (valorA < valorB ? 1 : -1);
    });
  }

  // Métodos para paginación
  calcularPaginacion(): void {
    if (!this.registros) return;
    
    this.totalPaginas = Math.ceil(this.registros.registros.length / this.registrosPorPagina);
    this.actualizarIndices();
  }

  actualizarIndices(): void {
    this.indiceInicio = (this.paginaActual - 1) * this.registrosPorPagina;
    this.indiceFin = Math.min(this.indiceInicio + this.registrosPorPagina, this.registros?.registros.length || 0);
    
    if (this.registros) {
      this.registrosOrdenados = this.registros.registros.slice(this.indiceInicio, this.indiceFin);
    }
  }

  paginaAnterior(): void {
    if (this.paginaActual > 1) {
      this.paginaActual--;
      this.actualizarIndices();
    }
  }

  paginaSiguiente(): void {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
      this.actualizarIndices();
    }
  }

  // Método para formatear valores
  formatearValor(valor: any): string {
    if (valor === null || valor === undefined) return '-';
    
    if (typeof valor === 'number') {
      // Formatear números con 2 decimales si son decimales
      return valor % 1 === 0 ? valor.toString() : valor.toFixed(2);
    }
    
    if (typeof valor === 'boolean') {
      return valor ? 'Sí' : 'No';
    }
    
    return valor.toString();
  }

  volverAlMapa(): void {
    this.router.navigate(['/home']);
  }
}