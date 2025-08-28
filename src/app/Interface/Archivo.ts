export interface Archivo {
  nombre: string;
  tipo: string;
  fecha: string;
  estatus: 'pendiente' | 'validado' | 'rechazado';
  comentario?: string; // solo para rechazados
}
