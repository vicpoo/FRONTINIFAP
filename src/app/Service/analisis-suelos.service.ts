// analisis-suelos.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaces para las respuestas de la API
export interface RegistroAnalisis {
  [key: string]: any; // Propiedades dinámicas del registro
}

export interface RegistrosMunicipio {
  municipio_id: number;
  municipio_nombre: string;
  total_registros: number;
  registros: RegistroAnalisis[];
  mensaje?: string;
}

export interface InterpretacionParametro {
  mediana: number;
  interpretacion: string;
  nivel: string;
  descripcion: string;
  muestras_validas: number;
}

export interface InterpretacionMunicipio {
  municipio_id: number;
  municipio_nombre: string;
  total_registros: number;
  interpretaciones: {
    [parametro: string]: InterpretacionParametro;
  };
}

export interface EstadisticasParametro {
  moda: number;
  mediana: number;
  media: number;
  sesgo: number;
  desviacion_estandar: number;
  maximo: number;
  minimo: number;
  count: number;
  q1: number;
  q3: number;
}

export interface EstadisticasMunicipio {
  municipio_id: number;
  municipio_nombre: string;
  total_registros: number;
  estadisticas: {
    [parametro: string]: EstadisticasParametro;
  };
}

export interface MunicipioInfo {
  municipio_id: number;
  municipio_nombre: string;
  registros_url: string;
  estadisticas_por_id_url: string;
  estadisticas_por_nombre_url: string;
  interpretacion_por_id_url: string;
  interpretacion_por_nombre_url: string;
}

export interface TodosMunicipiosResponse {
  total_municipios: number;
  municipios: MunicipioInfo[];
}

@Injectable({
  providedIn: 'root'
})
export class AnalisisSuelosService {
  private apiUrl = 'http://3.216.1.61:8002/';

  constructor(private http: HttpClient) {}

  // Obtener registros completos por ID de municipio
  getRegistrosPorId(municipioId: number): Observable<RegistrosMunicipio> {
    return this.http.get<RegistrosMunicipio>(`${this.apiUrl}registros/municipio/${municipioId}`);
  }

  // Obtener interpretación por ID de municipio
  getInterpretacionPorId(municipioId: number): Observable<InterpretacionMunicipio> {
    return this.http.get<InterpretacionMunicipio>(`${this.apiUrl}interpretacion/municipio/${municipioId}`);
  }

  // Obtener interpretación por nombre de municipio
  getInterpretacionPorNombre(municipioNombre: string): Observable<InterpretacionMunicipio> {
    return this.http.get<InterpretacionMunicipio>(`${this.apiUrl}interpretacion/municipio/nombre/${encodeURIComponent(municipioNombre)}`);
  }

  // Obtener estadísticas por ID de municipio
  getEstadisticasPorId(municipioId: number): Observable<EstadisticasMunicipio> {
    return this.http.get<EstadisticasMunicipio>(`${this.apiUrl}estadisticas/municipio/${municipioId}`);
  }

  // Obtener estadísticas por nombre de municipio
  getEstadisticasPorNombre(municipioNombre: string): Observable<EstadisticasMunicipio> {
    return this.http.get<EstadisticasMunicipio>(`${this.apiUrl}estadisticas/municipio/nombre/${encodeURIComponent(municipioNombre)}`);
  }

  // Obtener información de todos los municipios
  getTodosMunicipios(): Observable<TodosMunicipiosResponse> {
    return this.http.get<TodosMunicipiosResponse>(`${this.apiUrl}estadisticas/municipios`);
  }

  // Endpoint de saludo (para probar la conexión)
  getSaludo(nombre: string): Observable<{saludo: string}> {
    return this.http.get<{saludo: string}>(`${this.apiUrl}saludo/${nombre}`);
  }

  // Endpoint raíz (para probar la conexión)
  getRoot(): Observable<{mensaje: string}> {
    return this.http.get<{mensaje: string}>(this.apiUrl);
  }
}