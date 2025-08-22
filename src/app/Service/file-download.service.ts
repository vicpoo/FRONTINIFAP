// file-download.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileDownloadService {

  private apiUrl = 'http://50.16.232.175:8000/recomendaciones-nutricionales/';

  constructor(private http: HttpClient) {}

  // Método para descargar un PDF
  downloadPdf(nombrePdf: string, nombreArchivo: string = 'recomendacion.pdf'): void {
    this.http.get(`${this.apiUrl}download/${nombrePdf}`, {
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
}