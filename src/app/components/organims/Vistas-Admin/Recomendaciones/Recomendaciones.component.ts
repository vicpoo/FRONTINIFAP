//Recomendaciones.component.ts
// Recomendaciones.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecomendacionesNutricionalesService, RecomendacionNutricional } from '../../../../Service/recomendaciones-nutricionales.service';
import { FileDownloadService } from '../../../../Service/file-download.service';
import { MunicipiosService, Municipio } from '../../../../Service/municipios.service'; // Importar el servicio de municipios

interface RecomendacionUI {
  id: number;
  municipio_id: number;
  nombre_pdf: string;
  fecha_subida: string;
  descripcion?: string;
}

@Component({
  selector: 'app-recomendaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './Recomendaciones.component.html'
})
export class RecomendacionesComponent implements OnInit {
  recomendaciones: RecomendacionUI[] = [];
  recomendacionesFiltradas: RecomendacionUI[] = [];
  municipios: Municipio[] = []; // Lista de municipios

  filtroMunicipio: string = '';
  orden: string = 'recientes';

  modalAbierto = false;
  esNuevo = true;
  archivoSeleccionado: File | null = null;

  formRecomendacion: any = { 
    id: 0, 
    municipio_id_FK: null, 
    descripcion: '' 
  };

  constructor(
    private recomendacionesService: RecomendacionesNutricionalesService,
    private fileDownloadService: FileDownloadService,
    private municipiosService: MunicipiosService // Inyectar servicio de municipios
  ) {}

  ngOnInit() {
    this.cargarRecomendaciones();
    this.cargarMunicipios(); // Cargar municipios al inicializar
  }

  cargarMunicipios() {
    this.municipiosService.getMunicipios().subscribe(
      (data: Municipio[]) => {
        this.municipios = data;
        console.log('Municipios cargados:', this.municipios);
      },
      error => {
        console.error('Error al cargar municipios:', error);
      }
    );
  }

  cargarRecomendaciones() {
    this.recomendacionesService.getRecomendaciones().subscribe(
      (data: RecomendacionNutricional[]) => {
        this.recomendaciones = data.map(rec => ({
          id: rec.id,
          municipio_id: rec.municipio_id_FK,
          nombre_pdf: rec.nombre_pdf,
          fecha_subida: rec.fecha_subida,
          descripcion: `PDF: ${rec.nombre_pdf} - Subido: ${new Date(rec.fecha_subida).toLocaleDateString()} - Municipio ID: ${rec.municipio_id_FK}`
        }));
        this.aplicarFiltro();
      },
      error => {
        console.error('Error al cargar recomendaciones:', error);
      }
    );
  }

  aplicarFiltro() {
    let data = [...this.recomendaciones];
    
    // Filtrar por municipio (ID)
    if (this.filtroMunicipio.trim() !== '') {
      data = data.filter(r =>
        r.municipio_id.toString().includes(this.filtroMunicipio) ||
        r.descripcion?.toLowerCase().includes(this.filtroMunicipio.toLowerCase())
      );
    }
    
    // Ordenar
    if (this.orden === 'recientes') {
      data.sort((a, b) => new Date(b.fecha_subida).getTime() - new Date(a.fecha_subida).getTime());
    } else {
      data.sort((a, b) => new Date(a.fecha_subida).getTime() - new Date(b.fecha_subida).getTime());
    }
    
    this.recomendacionesFiltradas = data;
  }

  abrirModal(rec?: RecomendacionUI) {
    this.modalAbierto = true;
    if (rec) {
      this.esNuevo = false;
      this.formRecomendacion = { 
        id: rec.id, 
        municipio_id_FK: rec.municipio_id, // Usar el ID del municipio
        descripcion: rec.descripcion 
      };
    } else {
      this.esNuevo = true;
      this.formRecomendacion = { 
        id: 0, 
        municipio_id_FK: null, 
        descripcion: '' 
      };
    }
    this.archivoSeleccionado = null;
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  onFileSelected(event: any) {
    this.archivoSeleccionado = event.target.files[0];
  }

  guardarRecomendacion() {
    if (!this.formRecomendacion.municipio_id_FK) {
      alert('Por favor seleccione un municipio');
      return;
    }

    if (this.esNuevo && !this.archivoSeleccionado) {
      alert('Por favor seleccione un archivo PDF');
      return;
    }

    console.log('Enviando datos:', {
      id: this.formRecomendacion.id,
      municipio_id_FK: this.formRecomendacion.municipio_id_FK,
      archivo_pdf: this.archivoSeleccionado ? this.archivoSeleccionado.name : 'No se cambió'
    });

    if (this.esNuevo) {
      // Crear nueva recomendación
      this.recomendacionesService.addRecomendacion(
        this.formRecomendacion.municipio_id_FK,
        this.archivoSeleccionado!
      ).subscribe(
        (response) => {
          console.log('Recomendación creada:', response);
          this.cerrarModal();
          this.cargarRecomendaciones();
        },
        error => {
          console.error('Error al crear recomendación:', error);
          alert('Error al crear la recomendación');
        }
      );
    } else {
      // Actualizar recomendación existente
      this.recomendacionesService.updateRecomendacion(
        this.formRecomendacion.id,
        this.formRecomendacion.municipio_id_FK,
        this.archivoSeleccionado || undefined
      ).subscribe(
        (response) => {
          console.log('Recomendación actualizada:', response);
          this.cerrarModal();
          this.cargarRecomendaciones();
        },
        error => {
          console.error('Error al actualizar recomendación:', error);
          alert('Error al actualizar la recomendación');
        }
      );
    }
  }

  eliminar(rec: RecomendacionUI) {
    if (confirm(`¿Está seguro de eliminar la recomendación con ID ${rec.id}?`)) {
      this.recomendacionesService.deleteRecomendacion(rec.id).subscribe(
        () => {
          console.log('Recomendación eliminada');
          this.cargarRecomendaciones();
        },
        error => {
          console.error('Error al eliminar recomendación:', error);
          alert('Error al eliminar la recomendación');
        }
      );
    }
  }

 descargarPdf(id: number, nombrePdf: string) {
  this.fileDownloadService.downloadPdfById(id, nombrePdf);
}
}