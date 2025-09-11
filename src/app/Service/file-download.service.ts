// file-download.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileDownloadService {

  private apiUrl = 'http://3.224.87.135:8000/recomendaciones-nutricionales/';

  constructor(private http: HttpClient) {}

  // Método genérico para descargar archivos
  downloadFile(url: string, nombreArchivo: string): void {
    this.http.get(url, {
      responseType: 'blob'
    }).subscribe(
      (blob: Blob) => {
        // Crear un enlace temporal para descargar el archivo
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nombreArchivo;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error => {
        console.error('Error al descargar el archivo:', error);
        alert('Error al descargar el archivo');
      }
    );
  }

  // Método para descargar un PDF por ID
  downloadPdfById(id: number, nombreArchivo: string = 'recomendacion.pdf'): void {
    this.downloadFile(`${this.apiUrl}${id}/download`, nombreArchivo);
  }

  // Método para descargar un ZIP por municipio
  downloadZipByMunicipio(municipioId: number, nombreArchivo: string = 'recomendaciones.zip'): void {
    this.downloadFile(`${this.apiUrl}municipio/${municipioId}/download-zip`, nombreArchivo);
  }
}