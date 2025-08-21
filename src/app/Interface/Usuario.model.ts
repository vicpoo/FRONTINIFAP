export interface Usuario {
  id_user?: number;
  nombre: string;
  apellido: string;
  correo: string;
  numero_telefonico: string;
  password?: string;
  rol_id_FK: number;
}
