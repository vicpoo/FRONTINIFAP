// recomendaciones-nutricionales.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RecomendacionesNutricionalesService, RecomendacionNutricional } from '../../../../Service/recomendaciones-nutricionales.service';
import { MunicipiosService, Municipio } from '../../../../Service/municipios.service';
import { SideNavMapaComponent } from '../../Side-nav-mapa/side-nav-mapa.component';

@Component({
  selector: 'app-recomendaciones-nutricionales',
  standalone: true,
  imports: [CommonModule, HttpClientModule,SideNavMapaComponent],
  templateUrl: './recomendaciones-nutricionales.component.html',
  styleUrls: ['./recomendaciones-nutricionales.component.css']
})
export class RecomendacionesNutricionalesComponent implements OnInit {
  municipioId: number = 0;
  municipioNombre: string = 'Cargando...';
  recomendaciones: RecomendacionNutricional[] = [];
  cargando: boolean = true;
  error: string = '';

  // Variables para el modal de visualización de PDF
  mostrarModal: boolean = false;
  pdfActual: RecomendacionNutricional | null = null;
  urlPdf: SafeResourceUrl | null = null;
  // Guardamos la URL original del blob por separado
  originalBlobUrl: string | null = null;
  cargandoPdf: boolean = false;
  errorPdf: string = '';
  zoomLevel: number = 100;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private recomendacionesService: RecomendacionesNutricionalesService,
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

  visualizarPdf(recomendacion: RecomendacionNutricional): void {
    this.pdfActual = recomendacion;
    this.mostrarModal = true;
    this.cargandoPdf = true;
    this.errorPdf = '';
    this.zoomLevel = 100;
    
    // Obtener el PDF como blob y crear URL segura
    this.recomendacionesService.downloadPdfById(recomendacion.id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        this.originalBlobUrl = url; // Guardamos la URL original
        this.urlPdf = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        this.cargandoPdf = false;
      },
      error: (error) => {
        console.error('Error cargando PDF para visualización:', error);
        this.errorPdf = 'Error al cargar el documento para visualización';
        this.cargandoPdf = false;
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

  cerrarModal(): void {
    this.mostrarModal = false;
    this.pdfActual = null;
    this.urlPdf = null;
    
    // Liberar recursos de la URL del blob usando la URL original guardada
    if (this.originalBlobUrl) {
      try {
        window.URL.revokeObjectURL(this.originalBlobUrl);
        console.log('URL del blob liberada correctamente');
      } catch (e) {
        console.log('No se pudo liberar la URL del blob:', e);
      }
      this.originalBlobUrl = null;
    }
  }

  zoomIn(): void {
    this.zoomLevel += 10;
    this.aplicarZoom();
  }

  zoomOut(): void {
    if (this.zoomLevel > 50) {
      this.zoomLevel -= 10;
      this.aplicarZoom();
    }
  }

  private aplicarZoom(): void {
    // Esta función podría necesitar implementación adicional
    // si se quiere aplicar zoom al iframe del PDF
    console.log(`Zoom aplicado: ${this.zoomLevel}%`);
  }

  onPdfLoad(): void {
    console.log('PDF cargado en el visor');
    // Aquí se pueden realizar acciones adicionales cuando el PDF se carga
  }

  volverAlMapa(): void {
    this.router.navigate(['/home']);
  }

  // Método para refrescar las recomendaciones si es necesario
  refrescarRecomendaciones(): void {
    this.cargarRecomendaciones();
  }
}