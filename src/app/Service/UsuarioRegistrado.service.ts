import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioRegistradoService {
  private apiUrl = 'http://98.86.26.9:8001'; 

  constructor(private http: HttpClient) {}

  // ----------------------------
  // MÉTODOS PARA ANÁLISIS QUÍMICOS
  // ----------------------------

  uploadExcel(file: File, correoUsuario: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('correo_usuario', correoUsuario);
    formData.append('nombre_archivo', file.name);
    return this.http.post(`${this.apiUrl}/analisis-quimicos/upload-excel/`, formData);
  }

  getPendientes(correoUsuario: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/analisis-quimicos-validados/usuario/${correoUsuario}/pendientes/`);
  }

  getValidados(correoUsuario: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/analisis-quimicos-validados/usuario/${correoUsuario}/validados/`);
  }

  verificarComentario(correoUsuario: string, accion: 'verificar' | 'recibido'): Observable<any> {
    const body = { correo_usuario: correoUsuario, accion: accion };
    return this.http.post(`${this.apiUrl}/analisis-quimicos/verificar-comentario-invalido/`, body);
  }

  eliminarPendiente(correoUsuario: string, nombreArchivo: string): Observable<any> {
    const body = { nombre_archivo: nombreArchivo };
    return this.http.post(`${this.apiUrl}/analisis-quimicos-validados/usuario/${correoUsuario}/pendientes/archivo/`, body);
  }

  getComentariosInvalidos(correoUsuario: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/analisis-quimicos/obtener-comentario-invalido/?correo_usuario=${correoUsuario}`);
  }

  // ----------------------------
  // MÉTODOS PARA ANÁLISIS DE SUELOS
  // ----------------------------

  /** 1️⃣ Subir Excel de análisis de suelos (usuario normal) */
  uploadExcelSuelo(file: File, correoUsuario: string): Observable<any> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('correo_usuario', correoUsuario);
  formData.append('nombre_archivo', file.name);
  return this.http.post(`${this.apiUrl}/analisis-suelo/upload-excel/`, formData);
}

getPendientesSuelo(correoUsuario: string): Observable<any> {
  return this.http.get(`${this.apiUrl}/analisis-suelo-pendientes/pendientes-por-usuario-archivo`);
}

getValidadosSuelo(correoUsuario: string): Observable<any> {
  return this.http.get(`${this.apiUrl}/analisis-suelo-validados/usuario/${correoUsuario}/validados/`);
}

getComentariosInvalidosSuelo(correoUsuario: string): Observable<any> {
  return this.http.get(`${this.apiUrl}/analisis-suelo/obtener-comentario-invalido/?correo_usuario=${correoUsuario}`);
}

}
