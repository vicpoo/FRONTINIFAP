// recomendaciones-nutricionales.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

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
    return this.http.get<RecomendacionNutricional[]>(this.apiUrl)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  // Obtener una recomendación por ID
  getRecomendacion(id: number): Observable<RecomendacionNutricional> {
    return this.http.get<RecomendacionNutricional>(`${this.apiUrl}${id}`)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
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

    return this.http.post<RecomendacionNutricional>(this.apiUrl, formData)
      .pipe(
        catchError(this.handleError)
      );
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

    return this.http.put<RecomendacionNutricional>(`${this.apiUrl}${id}`, formData)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Eliminar una recomendación
  deleteRecomendacion(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Obtener recomendaciones por municipio
  getRecomendacionesByMunicipio(municipioId: number): Observable<RecomendacionNutricional[]> {
    return this.http.get<RecomendacionNutricional[]>(`${this.apiUrl}municipio/${municipioId}`)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  // Descargar un PDF por ID de recomendación
  downloadPdfById(id: number, nombreArchivo: string = 'recomendacion.pdf'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}${id}/download`, {
      responseType: 'blob'
    })
    .pipe(
      catchError(this.handleError)
    );
  }

  // Descargar todos los PDFs de un municipio como archivo ZIP
  downloadZipByMunicipio(municipioId: number, nombreArchivo: string = 'recomendaciones.zip'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}municipio/${municipioId}/download-zip`, {
      responseType: 'blob'
    })
    .pipe(
      catchError(this.handleError)
    );
  }

  // Manejo de errores
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ha ocurrido un error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      switch (error.status) {
        case 0:
          errorMessage = 'No se puede conectar al servidor. Verifica tu conexión a internet.';
          break;
        case 404:
          errorMessage = 'Recurso no encontrado.';
          break;
        case 500:
          errorMessage = 'Error interno del servidor.';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.message}`;
      }
    }
    
    console.error('Error en el servicio:', errorMessage);
    return throwError(() => errorMessage);
  }
}