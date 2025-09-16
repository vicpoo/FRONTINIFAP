// analisis.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { AnalisisSuelosService, EstadisticasMunicipio, InterpretacionMunicipio } from '../../../../Service/analisis-suelos.service';
import { MunicipiosService, Municipio } from '../../../../Service/municipios.service';
import { SideNavMapaComponent } from '../../Side-nav-mapa/side-nav-mapa.component';

@Component({
  selector: 'app-analisis',
  standalone: true,
  imports: [CommonModule, HttpClientModule,SideNavMapaComponent],
  templateUrl: './analisis.component.html',
})
export class AnalisisComponent implements OnInit {
  municipioId: number = 0;
  municipioNombre: string = 'Cargando...';
  estadisticas: EstadisticasMunicipio | null = null;
  interpretacion: InterpretacionMunicipio | null = null;
  cargando: boolean = true;
  error: string = '';
  activeTab: string = 'estadisticas';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private analisisService: AnalisisSuelosService,
    private municipiosService: MunicipiosService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    // Obtener el ID del municipio de la ruta
    this.municipioId = +this.route.snapshot.paramMap.get('id')!;
    
    // Primero intentar obtener el nombre del sessionStorage
    const nombreGuardado = sessionStorage.getItem('municipioNombre');
    if (nombreGuardado) {
      this.municipioNombre = nombreGuardado;
      sessionStorage.removeItem('municipioNombre'); // Limpiar después de usar
    } else {
      // Si no está en sessionStorage, obtenerlo del servicio
      this.obtenerNombreMunicipio();
    }
    
    // Cargar los datos de análisis
    this.cargarDatosAnalisis();
  }

  private obtenerNombreMunicipio(): void {
    this.municipiosService.getMunicipio(this.municipioId).subscribe({
      next: (municipio: Municipio) => {
        this.municipioNombre = municipio.nombre;
      },
      error: (error) => {
        console.error('Error obteniendo municipio:', error);
        this.municipioNombre = `Municipio ID: ${this.municipioId}`;
      }
    });
  }

  private cargarDatosAnalisis(): void {
    this.cargando = true;
    this.error = '';
    
    // Cargar estadísticas
    this.analisisService.getEstadisticasPorId(this.municipioId).subscribe({
      next: (estadisticas: EstadisticasMunicipio) => {
        this.estadisticas = estadisticas;
        
        // Una vez cargadas las estadísticas, cargar la interpretación
        this.analisisService.getInterpretacionPorId(this.municipioId).subscribe({
          next: (interpretacion: InterpretacionMunicipio) => {
            this.interpretacion = interpretacion;
            this.cargando = false;
            console.log('Datos de análisis cargados correctamente');
          },
          error: (error) => {
            console.error('Error cargando interpretación:', error);
            this.cargando = false;
            // No marcamos error aquí porque las estadísticas se cargaron correctamente
          }
        });
      },
      error: (error) => {
        console.error('Error cargando estadísticas:', error);
        this.error = 'Error al cargar los datos de análisis del suelo';
        this.cargando = false;
      }
    });
  }

  cambiarTab(tab: string): void {
    this.activeTab = tab;
  }

  volverAlMapa(): void {
    this.router.navigate(['/home']);
  }

  // Método para formatear números con decimales
  formatearNumero(valor: number, decimales: number = 2): string {
    return valor.toFixed(decimales);
  }

  // Método para obtener clase de color según el nivel
  obtenerClaseNivel(nivel: string): string {
    switch (nivel) {
      case 'bajo':
        return 'bg-red-100 text-red-800';
      case 'medio':
        return 'bg-yellow-100 text-yellow-800';
      case 'alto':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  // En el componente, agrega este método:
objectKeys(obj: any): string[] {
  return Object.keys(obj);
}
}