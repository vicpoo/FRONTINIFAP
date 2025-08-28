import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GestionArchivosAdminService {

  private baseUrl = 'http://98.86.26.9:8001';

  constructor(private http: HttpClient) {}

  /**
   * Obtener lista de todos los usuarios con archivos pendientes
   * Endpoint: /analisis-quimicos/usuarios-con-datos-pendientes/
   */
  getUsuariosConPendientes(): Observable<any> {
    const url = `${this.baseUrl}/analisis-quimicos/usuarios-con-datos-pendientes/`;
    return this.http.get<any>(url);
  }

  /**
   * Obtener detalles de archivos pendientes de un usuario
   * Endpoint: /analisis-quimicos-validados/usuario/{correo_usuario}/pendientes/
   * @param correoUsuario - Correo del usuario
   */
  getPendientesPorUsuario(correoUsuario: string): Observable<any> {
    const url = `${this.baseUrl}/analisis-quimicos-validados/usuario/${correoUsuario}/pendientes/`;
    return this.http.get<any>(url);
  }

  /**
   * Descargar archivo Excel de un usuario
   * Endpoint: /analisis-quimicos/descargar-datos-usuario/{user_id}
   * @param userId - ID del usuario
   */
  descargarArchivoUsuario(userId: number): Observable<Blob> {
    const url = `${this.baseUrl}/analisis-quimicos/descargar-datos-usuario/${userId}`;
    return this.http.get(url, { responseType: 'blob' });
  }

  /**
   * Validar archivo de un usuario
   * Endpoint: /analisis-quimicos-validados/validar-simple/{correo_usuario}/
   * @param correoUsuario - Correo del usuario
   * @param nombreArchivo - Nombre del archivo
   * @param comentario - Comentario del administrador
   */
  validarArchivo(correoUsuario: string, nombreArchivo: string, comentario: string): Observable<any> {
    const url = `${this.baseUrl}/analisis-quimicos-validados/validar-simple/${correoUsuario}/`;
    const body = {
      correo_usuario: correoUsuario,
      nombre_archivo: nombreArchivo,
      comentario: comentario
    };
    return this.http.post<any>(url, body);
  }

  /**
   * Rechazar archivo de un usuario
   * Endpoint: /analisis-quimicos/agregar-comentario-invalido/
   * @param adminId - ID del administrador
   * @param correoUsuario - Correo del usuario
   * @param comentarioInvalido - Comentario explicando el rechazo
   */
  rechazarArchivo(adminId: number, correoUsuario: string, comentarioInvalido: string): Observable<any> {
    const url = `${this.baseUrl}/analisis-quimicos/agregar-comentario-invalido/`;
    const body = {
      id_administrador: adminId,
      correo_usuario: correoUsuario,
      comentario_invalido: comentarioInvalido
    };
    return this.http.post<any>(url, body);
  }
}
