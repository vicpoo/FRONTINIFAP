// municipios.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interface para el modelo Municipio
export interface Municipio {
  id_municipio: number;
  clave_estado: number;
  clave_municipio: number;
  nombre: string;
}

@Injectable({
  providedIn: 'root'
})
export class MunicipiosService {
  private apiUrl = 'http://50.16.232.175:8000/municipios/';

  constructor(private http: HttpClient) { }

  // Obtener todos los municipios
  getMunicipios(): Observable<Municipio[]> {
    return this.http.get<Municipio[]>(this.apiUrl);
  }

  // Obtener un municipio por ID
  getMunicipio(id: number): Observable<Municipio> {
    return this.http.get<Municipio>(`${this.apiUrl}${id}`);
  }

  // Crear un nuevo municipio
  addMunicipio(municipio: Omit<Municipio, 'id_municipio'>): Observable<Municipio> {
    return this.http.post<Municipio>(this.apiUrl, municipio);
  }

  // Actualizar un municipio existente
  updateMunicipio(municipio: Municipio): Observable<Municipio> {
    return this.http.put<Municipio>(`${this.apiUrl}${municipio.id_municipio}`, municipio);
  }

  // Eliminar un municipio
  deleteMunicipio(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}${id}`);
  }
}