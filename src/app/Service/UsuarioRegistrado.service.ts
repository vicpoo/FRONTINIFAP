import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioRegistradoService {
  private apiUrl = 'http://98.86.26.9:8001'; // Ajusta si usas otro host o puerto

  constructor(private http: HttpClient) {}

  // 1. Subir archivo Excel de análisis químicos
  uploadExcel(file: File, correoUsuario: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('correo_usuario', correoUsuario);
    return this.http.post(`${this.apiUrl}/analisis-quimicos/upload-excel/`, formData);
  }

  // 2. Obtener archivos pendientes
  getPendientes(correoUsuario: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/analisis-quimicos-validados/usuario/${correoUsuario}/pendientes/`);
  }

  // 3. Obtener archivos validados
  getValidados(correoUsuario: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/analisis-quimicos-validados/usuario/${correoUsuario}/validados/`);
  }

  // 4. Verificar o marcar como recibido un comentario inválido
  verificarComentario(correoUsuario: string, accion: 'verificar' | 'recibido'): Observable<any> {
    const body = { correo_usuario: correoUsuario, accion: accion };
    return this.http.post(`${this.apiUrl}/analisis-quimicos/verificar-comentario-invalido/`, body);
  }

  // 5. Eliminar un archivo pendiente
  eliminarPendiente(correoUsuario: string, nombreArchivo: string): Observable<any> {
    const body = { nombre_archivo: nombreArchivo };
    return this.http.post(`${this.apiUrl}/analisis-quimicos-validados/usuario/${correoUsuario}/pendientes/archivo/`, body);
  }
}
