// Clasificacion.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClasificacionResultadosService, ClasificacionResultados } from '../../../../Service/clasificacion-resultados.service';
import { MunicipiosService, Municipio } from '../../../../Service/municipios.service';

interface ClasificacionUI {
  id: number;
  municipio_id_FK: number;
  analisis_tipo: string;
  fecha_analisis: string;
  resultado_general: string;
  nutrientes_criticos: string;
  comentario: string;
  imagen: string;
  user_id_FK: number;
  fecha_creacion: string;
  descripcion?: string;
  municipioNombre?: string;
}

@Component({
  selector: 'app-clasificacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './Clasificacion.component.html'
})
export class ClasificacionComponent implements OnInit {
  clasificaciones: ClasificacionUI[] = [];
  clasificacionesFiltradas: ClasificacionUI[] = [];
  municipios: Municipio[] = [];

  filtroMunicipio: string = '';
  orden: string = 'recientes';
  cargando: boolean = false;

  modalAbierto = false;
  modalImagenAbierto = false;
  esNuevo = true;
  archivoImagenSeleccionado: File | null = null;
  clasificacionSeleccionadaId: number = 0;

  formClasificacion: any = { 
    id: 0, 
    municipio_id_FK: null, 
    analisis_tipo: '',
    fecha_analisis: '',
    resultado_general: '',
    nutrientes_criticos: '',
    comentario: '',
    user_id_FK: 1
  };

  tiposAnalisis = [
    'Análisis de suelo',
    'Análisis foliar',
    'Análisis de agua',
    'Análisis de calidad',
    'Otro'
  ];

  constructor(
    private clasificacionService: ClasificacionResultadosService,
    private municipiosService: MunicipiosService
  ) {}

  ngOnInit() {
    this.cargarMunicipios();
    this.cargarClasificaciones();
  }

  cargarMunicipios() {
    this.municipiosService.getMunicipios().subscribe(
      (data: Municipio[]) => {
        this.municipios = data || [];
        console.log('Municipios cargados:', this.municipios);
      },
      error => {
        console.error('Error al cargar municipios:', error);
        this.municipios = [];
      }
    );
  }

  cargarClasificaciones() {
    this.cargando = true;
    this.clasificacionService.getClasificaciones().subscribe(
      (data: ClasificacionResultados[]) => {
        console.log('Datos recibidos de la API:', data);
        this.clasificaciones = (data || []).map(clas => {
          // Buscar el nombre del municipio
          const municipio = this.municipios.find(m => m.id_municipio === clas.municipio_id_FK);
          
          return {
            id: clas.id,
            municipio_id_FK: clas.municipio_id_FK,
            analisis_tipo: clas.analisis_tipo,
            fecha_analisis: clas.fecha_analisis,
            resultado_general: clas.resultado_general,
            nutrientes_criticos: clas.nutrientes_criticos || '',
            comentario: clas.comentario || '',
            imagen: clas.imagen || '',
            user_id_FK: clas.user_id_FK,
            fecha_creacion: clas.fecha_creacion,
            municipioNombre: municipio ? municipio.nombre : `Municipio ${clas.municipio_id_FK}`,
            descripcion: `${clas.analisis_tipo} - ${clas.resultado_general} - ${this.formatDateForDisplay(clas.fecha_analisis)}`
          };
        });
        this.aplicarFiltro();
        this.cargando = false;
      },
      error => {
        console.error('Error al cargar clasificaciones:', error);
        this.clasificaciones = [];
        this.aplicarFiltro();
        this.cargando = false;
      }
    );
  }

  aplicarFiltro() {
    let data = [...(this.clasificaciones || [])];
    
    if (this.filtroMunicipio.trim() !== '') {
      const filtroLower = this.filtroMunicipio.toLowerCase();
      data = data.filter(c => {
        return (
          c.municipio_id_FK.toString().includes(filtroLower) ||
          (c.municipioNombre?.toLowerCase() || '').includes(filtroLower) ||
          (c.descripcion?.toLowerCase() || '').includes(filtroLower) ||
          c.analisis_tipo.toLowerCase().includes(filtroLower) ||
          c.resultado_general.toLowerCase().includes(filtroLower) ||
          (c.nutrientes_criticos?.toLowerCase() || '').includes(filtroLower) ||
          (c.comentario?.toLowerCase() || '').includes(filtroLower)
        );
      });
    }
    
    if (this.orden === 'recientes') {
      data.sort((a, b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime());
    } else {
      data.sort((a, b) => new Date(a.fecha_creacion).getTime() - new Date(b.fecha_creacion).getTime());
    }
    
    this.clasificacionesFiltradas = data;
  }

  abrirModal(clas?: ClasificacionUI) {
    this.modalAbierto = true;
    if (clas) {
      this.esNuevo = false;
      this.formClasificacion = { 
        id: clas.id, 
        municipio_id_FK: clas.municipio_id_FK,
        analisis_tipo: clas.analisis_tipo,
        fecha_analisis: this.formatDateForInput(clas.fecha_analisis),
        resultado_general: clas.resultado_general,
        nutrientes_criticos: clas.nutrientes_criticos || '',
        comentario: clas.comentario || '',
        user_id_FK: clas.user_id_FK
      };
    } else {
      this.esNuevo = true;
      this.formClasificacion = { 
        id: 0, 
        municipio_id_FK: null, 
        analisis_tipo: '',
        fecha_analisis: '',
        resultado_general: '',
        nutrientes_criticos: '',
        comentario: '',
        user_id_FK: 1
      };
    }
  }

  formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    try {
      // Manejar diferentes formatos de fecha
      let date: Date;
      if (dateString.includes('T')) {
        date = new Date(dateString);
      } else {
        date = new Date(dateString + 'T00:00:00');
      }
      
      if (isNaN(date.getTime())) {
        console.warn('Fecha inválida:', dateString);
        return '';
      }
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Error al formatear fecha para input:', error);
      return '';
    }
  }

  formatDateForDisplay(dateString: string): string {
    if (!dateString) return '';
    try {
      let date: Date;
      if (dateString.includes('T')) {
        date = new Date(dateString);
      } else {
        date = new Date(dateString + 'T00:00:00');
      }
      
      if (isNaN(date.getTime())) {
        return dateString;
      }
      
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      console.error('Error al formatear fecha para display:', error);
      return dateString;
    }
  }

  abrirModalImagen(clasificacionId: number) {
    this.modalImagenAbierto = true;
    this.clasificacionSeleccionadaId = clasificacionId;
    this.archivoImagenSeleccionado = null;
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.modalImagenAbierto = false;
    this.archivoImagenSeleccionado = null;
  }

  onFileSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      
      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Tipo de archivo no permitido. Solo se aceptan imágenes JPG, PNG, GIF, WEBP o BMP');
        return;
      }
      
      // Validar tamaño (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        alert('El archivo es demasiado grande. Máximo 5MB');
        return;
      }
      
      this.archivoImagenSeleccionado = file;
    }
  }

  validarFormulario(): boolean {
    if (!this.formClasificacion.municipio_id_FK) {
      alert('Por favor seleccione un municipio');
      return false;
    }

    if (!this.formClasificacion.analisis_tipo) {
      alert('Por favor seleccione el tipo de análisis');
      return false;
    }

    if (!this.formClasificacion.fecha_analisis) {
      alert('Por favor ingrese la fecha de análisis');
      return false;
    }

    if (!this.formClasificacion.resultado_general) {
      alert('Por favor ingrese el resultado general');
      return false;
    }

    // Validar que la fecha no sea futura
    const fechaSeleccionada = new Date(this.formClasificacion.fecha_analisis);
    const hoy = new Date();
    if (fechaSeleccionada > hoy) {
      alert('La fecha de análisis no puede ser futura');
      return false;
    }

    return true;
  }

  guardarClasificacion() {
    if (!this.validarFormulario()) {
      return;
    }

    console.log('Enviando datos de clasificación:', this.formClasificacion);

    // Preparar los datos para la API
    const datosParaAPI = {
      municipio_id_FK: Number(this.formClasificacion.municipio_id_FK),
      analisis_tipo: this.formClasificacion.analisis_tipo,
      fecha_analisis: this.formClasificacion.fecha_analisis,
      resultado_general: this.formClasificacion.resultado_general,
      nutrientes_criticos: this.formClasificacion.nutrientes_criticos || '',
      comentario: this.formClasificacion.comentario || '',
      user_id_FK: Number(this.formClasificacion.user_id_FK)
    };

    if (this.esNuevo) {
      this.clasificacionService.addClasificacion(datosParaAPI).subscribe(
        (response) => {
          console.log('Clasificación creada:', response);
          alert('Clasificación creada exitosamente');
          this.cerrarModal();
          this.cargarClasificaciones();
        },
        error => {
          console.error('Error al crear clasificación:', error);
          alert('Error al crear la clasificación: ' + (error.message || 'Error desconocido'));
        }
      );
    } else {
      this.clasificacionService.updateClasificacion(this.formClasificacion.id, datosParaAPI).subscribe(
        (response) => {
          console.log('Clasificación actualizada:', response);
          alert('Clasificación actualizada exitosamente');
          this.cerrarModal();
          this.cargarClasificaciones();
        },
        error => {
          console.error('Error al actualizar clasificación:', error);
          alert('Error al actualizar la clasificación: ' + (error.message || 'Error desconocido'));
        }
      );
    }
  }

  subirImagen() {
    if (!this.archivoImagenSeleccionado) {
      alert('Por favor seleccione una imagen');
      return;
    }

    if (this.clasificacionSeleccionadaId <= 0) {
      alert('Error: ID de clasificación inválido');
      return;
    }

    this.clasificacionService.uploadImage(this.clasificacionSeleccionadaId, this.archivoImagenSeleccionado).subscribe(
      (response) => {
        console.log('Imagen subida:', response);
        alert('Imagen subida correctamente');
        this.cerrarModal();
        this.cargarClasificaciones();
      },
      error => {
        console.error('Error al subir imagen:', error);
        alert('Error al subir la imagen: ' + (error.message || 'Error desconocido'));
      }
    );
  }

  eliminar(clas: ClasificacionUI) {
    const mensaje = `¿Está seguro de eliminar la clasificación del ${clas.municipioNombre} (ID: ${clas.id})?
Tipo: ${clas.analisis_tipo}
Fecha: ${this.formatDateForDisplay(clas.fecha_analisis)}`;
    
    if (confirm(mensaje)) {
      this.clasificacionService.deleteClasificacion(clas.id).subscribe(
        (response) => {
          console.log('Clasificación eliminada:', response);
          alert('Clasificación eliminada correctamente');
          this.cargarClasificaciones();
        },
        error => {
          console.error('Error al eliminar clasificación:', error);
          alert('Error al eliminar la clasificación: ' + (error.message || 'Error desconocido'));
        }
      );
    }
  }

  getImageUrl(filename: string): string {
    if (!filename || filename.trim() === '') {
      return '';
    }
    return this.clasificacionService.getImageUrl(filename);
  }

  tieneImagen(clas: ClasificacionUI): boolean {
    return !!clas.imagen && clas.imagen.trim() !== '';
  }

  getMunicipioNombre(municipioId: number): string {
    const municipio = this.municipios.find(m => m.id_municipio === municipioId);
    return municipio ? municipio.nombre : `Municipio ${municipioId}`;
  }

  trackByClasificacion(index: number, item: ClasificacionUI): number {
    return item.id;
  }
}