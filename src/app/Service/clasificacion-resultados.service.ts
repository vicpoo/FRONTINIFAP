// clasificacion-resultados.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

export interface ClasificacionResultados {
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
}

@Injectable({
  providedIn: 'root'
})
export class ClasificacionResultadosService {
  private apiUrl = 'http://3.224.87.135:8000/clasificacion-resultados';

  constructor(private http: HttpClient) {}

  getClasificaciones(): Observable<ClasificacionResultados[]> {
    return this.http.get<ClasificacionResultados[]>(this.apiUrl)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  getClasificacion(id: number): Observable<ClasificacionResultados> {
    return this.http.get<ClasificacionResultados>(`${this.apiUrl}/${id}`)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  addClasificacion(clasificacionData: {
    municipio_id_FK: number;
    analisis_tipo: string;
    fecha_analisis: string;
    resultado_general: string;
    nutrientes_criticos?: string;
    comentario?: string;
    user_id_FK: number;
  }): Observable<ClasificacionResultados> {
    
    const payload = {
      municipio_id_FK: clasificacionData.municipio_id_FK,
      analisis_tipo: clasificacionData.analisis_tipo,
      fecha_analisis: clasificacionData.fecha_analisis,
      resultado_general: clasificacionData.resultado_general,
      nutrientes_criticos: clasificacionData.nutrientes_criticos || '',
      comentario: clasificacionData.comentario || '',
      user_id_FK: clasificacionData.user_id_FK
    };

    console.log('Enviando payload CREATE:', JSON.stringify(payload, null, 2));

    return this.http.post<ClasificacionResultados>(this.apiUrl, payload)
      .pipe(
        catchError(this.handleError)
      );
  }

  updateClasificacion(
    id: number,
    clasificacionData: {
      municipio_id_FK?: number;
      analisis_tipo?: string;
      fecha_analisis?: string;
      resultado_general?: string;
      nutrientes_criticos?: string;
      comentario?: string;
      user_id_FK?: number;
    }
  ): Observable<ClasificacionResultados> {

    // Para el update, enviar todos los campos que no sean undefined
    const payload: any = {};
    
    if (clasificacionData.municipio_id_FK !== undefined) {
      payload.municipio_id_FK = clasificacionData.municipio_id_FK;
    }
    if (clasificacionData.analisis_tipo !== undefined) {
      payload.analisis_tipo = clasificacionData.analisis_tipo;
    }
    if (clasificacionData.fecha_analisis !== undefined) {
      payload.fecha_analisis = clasificacionData.fecha_analisis;
    }
    if (clasificacionData.resultado_general !== undefined) {
      payload.resultado_general = clasificacionData.resultado_general;
    }
    if (clasificacionData.nutrientes_criticos !== undefined) {
      payload.nutrientes_criticos = clasificacionData.nutrientes_criticos;
    }
    if (clasificacionData.comentario !== undefined) {
      payload.comentario = clasificacionData.comentario;
    }
    if (clasificacionData.user_id_FK !== undefined) {
      payload.user_id_FK = clasificacionData.user_id_FK;
    }

    console.log('Enviando payload UPDATE:', JSON.stringify(payload, null, 2));

    return this.http.put<ClasificacionResultados>(`${this.apiUrl}/${id}`, payload)
      .pipe(
        catchError(this.handleError)
      );
  }

  deleteClasificacion(id: number): Observable<{status: string}> {
    console.log('Eliminando clasificación ID:', id);
    return this.http.delete<{status: string}>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getClasificacionesByMunicipio(municipioId: number): Observable<ClasificacionResultados[]> {
    return this.http.get<ClasificacionResultados[]>(`${this.apiUrl}/municipio/${municipioId}`)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  uploadImage(
    id: number,
    imagen: File
  ): Observable<ClasificacionResultados> {
    const formData = new FormData();
    formData.append('imagen', imagen);

    console.log('Subiendo imagen para clasificación ID:', id);

    return this.http.post<ClasificacionResultados>(`${this.apiUrl}/${id}/upload-image`, formData)
      .pipe(
        catchError(this.handleError)
      );
  }

  getImageUrl(filename: string): string {
    if (!filename) return '';
    return `http://50.16.232.175:8000/uploads/images/clasificacion/${filename}`;
  }

  downloadImage(filename: string): Observable<Blob> {
    return this.http.get(this.getImageUrl(filename), {
      responseType: 'blob'
    })
    .pipe(
      catchError(this.handleError)
    );
  }

  formatDateForApi(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  parseDateFromApi(dateString: string): Date {
    // Manejar tanto formato "2024-01-15" como "2024-01-15T00:00:00Z"
    if (dateString.includes('T')) {
      return new Date(dateString);
    } else {
      return new Date(dateString + 'T00:00:00');
    }
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ha ocurrido un error desconocido';
    
    console.error('Error HTTP completo:', error);
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 0:
          errorMessage = 'No se puede conectar al servidor. Verifica tu conexión a internet.';
          break;
        case 400:
          errorMessage = 'Datos inválidos. Verifica la información enviada.';
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          } else if (error.error && error.error.error) {
            errorMessage = error.error.error;
          }
          break;
        case 404:
          errorMessage = 'Recurso no encontrado.';
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          break;
        case 500:
          errorMessage = 'Error interno del servidor.';
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.message}`;
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          } else if (error.error && typeof error.error === 'string') {
            errorMessage = error.error;
          }
      }
    }
    
    console.error('Error en el servicio de clasificación:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}