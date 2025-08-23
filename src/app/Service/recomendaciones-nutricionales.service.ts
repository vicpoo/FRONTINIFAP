// recomendaciones-nutricionales.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interface para la entidad RecomendacionNutricional
export interface RecomendacionNutricional {
  id: number;
  municipio_id_FK: number;
  nombre_pdf: string;
  ruta_pdf: string;
  fecha_subida: string;
  user_id_FK: number;
}

@Injectable({
  providedIn: 'root'
})
export class RecomendacionesNutricionalesService {
  private apiUrl = 'http://50.16.232.175:8000/recomendaciones-nutricionales/';

  constructor(private http: HttpClient) {}

  // Obtener todas las recomendaciones
  getRecomendaciones(): Observable<RecomendacionNutricional[]> {
    return this.http.get<RecomendacionNutricional[]>(this.apiUrl);
  }

  // Obtener una recomendación por ID
  getRecomendacion(id: number): Observable<RecomendacionNutricional> {
    return this.http.get<RecomendacionNutricional>(`${this.apiUrl}${id}`);
  }

  // Crear una nueva recomendación (con archivo PDF)
  addRecomendacion(
    municipioId: number, 
    archivoPdf: File
  ): Observable<RecomendacionNutricional> {
    const formData = new FormData();
    formData.append('municipio_id_FK', municipioId.toString());
    formData.append('user_id_FK', '1'); // Enviar user_id_FK = 1 como solicitaste
    formData.append('archivo_pdf', archivoPdf);

    console.log('Enviando datos:', {
      municipio_id_FK: municipioId,
      user_id_FK: 1,
      archivo_pdf: archivoPdf.name
    });

    return this.http.post<RecomendacionNutricional>(this.apiUrl, formData);
  }

  // Actualizar una recomendación existente
  updateRecomendacion(
    id: number,
    municipioId: number, 
    archivoPdf?: File
  ): Observable<RecomendacionNutricional> {
    const formData = new FormData();
    formData.append('municipio_id_FK', municipioId.toString());
    formData.append('user_id_FK', '1'); // Enviar user_id_FK = 1 como solicitaste
    
    if (archivoPdf) {
      formData.append('archivo_pdf', archivoPdf);
    }

    console.log('Actualizando datos:', {
      id: id,
      municipio_id_FK: municipioId,
      user_id_FK: 1,
      archivo_pdf: archivoPdf ? archivoPdf.name : 'No se cambió'
    });

    return this.http.put<RecomendacionNutricional>(`${this.apiUrl}${id}`, formData);
  }

  // Eliminar una recomendación
  deleteRecomendacion(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}${id}`);
  }

  // Obtener recomendaciones por municipio
  getRecomendacionesByMunicipio(municipioId: number): Observable<RecomendacionNutricional[]> {
    return this.http.get<RecomendacionNutricional[]>(`${this.apiUrl}municipio/${municipioId}`);
  }

  // Descargar un PDF por ID de recomendación
  downloadPdfById(id: number, nombreArchivo: string = 'recomendacion.pdf'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}${id}/download`, {
      responseType: 'blob'
    });
  }

  // Descargar todos los PDFs de un municipio como archivo ZIP
  downloadZipByMunicipio(municipioId: number, nombreArchivo: string = 'recomendaciones.zip'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}municipio/${municipioId}/download-zip`, {
      responseType: 'blob'
    });
  }
}