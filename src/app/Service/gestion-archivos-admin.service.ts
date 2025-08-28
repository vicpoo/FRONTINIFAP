import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GestionArchivosAdminService {
  private baseUrl = 'http://98.86.26.9:8001';

  constructor(private http: HttpClient) {}

  // ========================
  // MÉTODOS PARA ANÁLISIS QUÍMICOS
  // ========================

  getUsuariosConPendientes(): Observable<any> {
    const url = `${this.baseUrl}/analisis-quimicos/usuarios-con-datos-pendientes/`;
    return this.http.get<any>(url);
  }

  getPendientesPorUsuario(correoUsuario: string): Observable<any> {
    const url = `${this.baseUrl}/analisis-quimicos-validados/usuario/${correoUsuario}/pendientes/`;
    return this.http.get<any>(url);
  }

  descargarArchivo(userId: number, nombreArchivo?: string): Observable<Blob> {
    let url = `${this.baseUrl}/analisis-quimicos/descargar-datos-usuario/${userId}`;
    if (nombreArchivo) {
      url += `?nombre_archivo=${encodeURIComponent(nombreArchivo)}`;
    }
    return this.http.get(url, { responseType: 'blob' });
  }

  validarArchivo(correoUsuario: string, nombreArchivo: string, comentario: string): Observable<any> {
    const url = `${this.baseUrl}/analisis-quimicos-validados/validar-simple/${correoUsuario}/`;
    const body = { nombre_archivo: nombreArchivo, comentario_validacion: comentario };
    return this.http.post<any>(url, body);
  }

  rechazarArchivo(adminId: number, correoUsuario: string, comentarioInvalido: string): Observable<any> {
    const url = `${this.baseUrl}/analisis-quimicos/agregar-comentario-invalido/`;
    const body = new URLSearchParams();
    body.set('user_id_administrador', adminId.toString());
    body.set('correo_usuario', correoUsuario);
    body.set('comentario_invalido', comentarioInvalido);
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    return this.http.post<any>(url, body.toString(), { headers });
  }

  // ========================
  // MÉTODOS PARA ANÁLISIS DE SUELOS
  // ========================

  getUsuariosConPendientesSuelo(): Observable<any> {
    const url = `${this.baseUrl}/analisis-suelos-pendientes/usuarios-con-pendientes`;
    return this.http.get<any>(url);
  }

  getPendientesPorUsuarioSuelo(correoUsuario: string): Observable<any> {
    const url = `${this.baseUrl}/analisis-suelos-validados/usuario/${correoUsuario}/pendientes/`;
    return this.http.get<any>(url);
  }

  descargarArchivoSuelo(userId: number, nombreArchivo?: string): Observable<Blob> {
    let url = `${this.baseUrl}/analisis-suelos-pendientes/descargar-excel/${userId}
`;
    if (nombreArchivo) {
      url += `?nombre_archivo=${encodeURIComponent(nombreArchivo)}`;
    }
    return this.http.get(url, { responseType: 'blob' });
  }

  validarArchivoSuelo(correoUsuario: string, nombreArchivo: string, comentario: string): Observable<any> {
    const url = `${this.baseUrl}/api/v1/suelos-validados/validar-por-correo`;
    const body = { nombre_archivo: nombreArchivo, comentario_validacion: comentario };
    return this.http.post<any>(url, body);
  }

  rechazarArchivoSuelo(adminId: number, correoUsuario: string, comentarioInvalido: string): Observable<any> {
    const url = `${this.baseUrl}/analisis-suelos-pendientes/comentario-invalido`;
    const body = new URLSearchParams();
    body.set('user_id_administrador', adminId.toString());
    body.set('correo_usuario', correoUsuario);
    body.set('comentario_invalido', comentarioInvalido);
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    return this.http.post<any>(url, body.toString(), { headers });
  }
}
