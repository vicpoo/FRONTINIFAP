import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GestionArchivosAdminService } from '../../../../Service/gestion-archivos-admin.service';




@Component({
  selector: 'app-gestion-archivos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './Gestion-Archivos.component.html'
})
export class GestionArchivosComponent implements OnInit {

  empleados: string[] = [];
  archivos: ArchivoPendiente[] = [];
  archivosOriginales: ArchivoPendiente[] = [];

  filtroEmpleado: string = '';
  filtroFecha: string = '';

  detallesUsuario: any = null;
  usuarioSeleccionado: string = '';

  modalAbierto: boolean = false;
archivoSeleccionado: any = null;
estatusSeleccionado: string = 'aprobado';
comentario: string = '';

  constructor(private gestionArchivosService: GestionArchivosAdminService) {}

  ngOnInit(): void {
    this.obtenerUsuariosPendientes();
  }

  /**
   * Obtener lista de usuarios con archivos pendientes
   */
  obtenerUsuariosPendientes(): void {
    this.gestionArchivosService.getUsuariosConPendientes().subscribe({
      next: (data) => {
        // Backend devuelve un array con usuarios
        const usuarios = data?.usuarios || [];

        this.archivosOriginales = usuarios.map((usuario: any) => ({
          usuario: usuario.nombre_usuario,
          correo: usuario.correo_usuario,
          nombre: usuario.nombre_archivo || 'No especificado',
          fecha: usuario.fecha_subida || 'Sin fecha',
          estatus: 'PENDIENTE'
        }));

        this.archivos = [...this.archivosOriginales];
        this.empleados = Array.from(
  new Set(usuarios.map((u: any) => String(u.nombre_usuario)))
) as string[];

      },
      error: (err) => {
        console.error('Error al obtener usuarios pendientes:', err);
      }
    });
  }

  /**
   * Obtener detalles de archivos pendientes de un usuario seleccionado
   */
  verDetallesPendientes(correo: string): void {
    this.usuarioSeleccionado = correo;
    this.gestionArchivosService.getPendientesPorUsuario(correo).subscribe({
      next: (data) => {
        this.detallesUsuario = data;
        console.log('Detalles pendientes de usuario:', this.detallesUsuario);
      },
      error: (err) => {
        console.error('Error al obtener detalles del usuario:', err);
      }
    });
  }

  /**
   * Filtrar lista de archivos por nombre de usuario y fecha
   */
  aplicarFiltros(): void {
    this.archivos = this.archivosOriginales.filter(a => {
      const coincideEmpleado = this.filtroEmpleado ? a.usuario === this.filtroEmpleado : true;
      const coincideFecha = this.filtroFecha ? a.fecha === this.filtroFecha : true;
      return coincideEmpleado && coincideFecha;
    });
  }

  abrirModal(archivo: any): void {
  this.archivoSeleccionado = archivo;
  this.modalAbierto = true;
}

cerrarModal(): void {
  this.modalAbierto = false;
  this.archivoSeleccionado = null;
  this.estatusSeleccionado = 'aprobado';
  this.comentario = '';
}

getArchivoUrl(archivo: any): string {
  // Aquí iría la lógica para obtener la URL del archivo del backend
  return archivo.url || '';
}

guardarRevision(): void {
  console.log('Archivo:', this.archivoSeleccionado);
  console.log('Estatus:', this.estatusSeleccionado);
  console.log('Comentario:', this.comentario);
  // Aquí después se agregará la llamada al service para actualizar en backend
  this.cerrarModal();
}
}
