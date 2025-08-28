 export interface ArchivoPendiente {
  usuario: string;
  correo: string;
  nombre: string;
  fecha: string;
  estatus: string;
  id_user?: number; // agregado para descarga
}