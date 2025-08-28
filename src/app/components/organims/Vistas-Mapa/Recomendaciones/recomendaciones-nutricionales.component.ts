// recomendaciones-nutricionales.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

// Importar servicios
import { RecomendacionesNutricionalesService, RecomendacionNutricional } from '../../../../Service/recomendaciones-nutricionales.service';
import { MunicipiosService, Municipio } from '../../../../Service/municipios.service';

@Component({
  selector: 'app-recomendaciones-nutricionales',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './recomendaciones-nutricionales.component.html',
  styleUrls: ['./recomendaciones-nutricionales.component.css']
})
export class RecomendacionesNutricionalesComponent implements OnInit {
  municipioId: number = 0;
  municipioNombre: string = 'Cargando...';
  recomendaciones: RecomendacionNutricional[] = [];
  cargando: boolean = true;
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private recomendacionesService: RecomendacionesNutricionalesService,
    private municipiosService: MunicipiosService
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
    
    // Cargar las recomendaciones
    this.cargarRecomendaciones();
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

  private cargarRecomendaciones(): void {
    this.cargando = true;
    this.error = '';
    
    this.recomendacionesService.getRecomendacionesByMunicipio(this.municipioId).subscribe({
      next: (recomendaciones: RecomendacionNutricional[]) => {
        this.recomendaciones = recomendaciones;
        this.cargando = false;
        
        console.log(`Cargadas ${recomendaciones.length} recomendaciones para el municipio ${this.municipioNombre}`);
      },
      error: (error) => {
        console.error('Error cargando recomendaciones:', error);
        this.error = 'Error al cargar las recomendaciones nutricionales';
        this.cargando = false;
      }
    });
  }

  descargarPdf(recomendacion: RecomendacionNutricional): void {
    const nombreArchivo = recomendacion.nombre_pdf || `recomendacion_${this.municipioNombre}.pdf`;
    
    console.log(`Iniciando descarga del PDF: ${nombreArchivo}`);
    
    this.recomendacionesService.downloadPdfById(recomendacion.id, nombreArchivo).subscribe({
      next: (blob: Blob) => {
        // Crear enlace temporal para descargar
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nombreArchivo;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        console.log(`PDF descargado exitosamente: ${nombreArchivo}`);
      },
      error: (error) => {
        console.error('Error descargando PDF:', error);
        alert('Error al descargar el archivo. Por favor, inténtalo de nuevo.');
      }
    });
  }

  volverAlMapa(): void {
    this.router.navigate(['/home']);
  }

  // Método para refrescar las recomendaciones si es necesario
  refrescarRecomendaciones(): void {
    this.cargarRecomendaciones();
  }
}