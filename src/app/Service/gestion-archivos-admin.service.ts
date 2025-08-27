import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GestionArchivosAdminService {

  private baseUrl = 'http://98.86.26.9:8001';

  constructor(private http: HttpClient) {}

  /**
   * Obtener lista de todos los usuarios con archivos pendientes
   * Endpoint: /analisis-quimicos-validados/usuarios-con-pendientes/
   */
  getUsuariosConPendientes(): Observable<any> {
    const url = `${this.baseUrl}/analisis-quimicos-validados/usuarios-con-pendientes/`;
    return this.http.get<any>(url);
  }

  /**
   * Obtener detalles de archivos pendientes de un usuario
   * Endpoint: /analisis-quimicos-validados/usuario/{correo_usuario}/pendientes/
   * @param correoUsuario - Correo del usuario a consultar
   */
  getPendientesPorUsuario(correoUsuario: string): Observable<any> {
    const url = `${this.baseUrl}/analisis-quimicos-validados/usuario/${correoUsuario}/pendientes/`;
    return this.http.get<any>(url);
  }
}
