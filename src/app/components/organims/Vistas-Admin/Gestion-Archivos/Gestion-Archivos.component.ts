import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GestionArchivosAdminService } from '../../../../Service/gestion-archivos-admin.service';

interface ArchivoPendiente {
  usuario: string;
  correo: string;
  nombre: string;
  fecha: string;
  estatus: string;
  id_user?: number; // agregado para descarga
}

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
  archivoSeleccionado: ArchivoPendiente | null = null;
  accionSeleccionada: string = ''; // validar | rechazar
  comentario: string = '';
  intentoGuardar: boolean = false;

  constructor(private gestionArchivosService: GestionArchivosAdminService) {}

  ngOnInit(): void {
    this.obtenerUsuariosPendientes();
  }

  obtenerUsuariosPendientes(): void {
    this.gestionArchivosService.getUsuariosConPendientes().subscribe({
      next: (data) => {
        const usuarios = data?.usuarios || [];
        this.archivosOriginales = usuarios.flatMap((usuario: any) =>
          (usuario.nombres_archivos || []).map((archivo: string) => ({
            usuario: usuario.nombre_usuario,
            correo: usuario.correo,
            nombre: archivo,
            fecha: usuario.fecha_creacion,
            estatus: usuario.estatus?.toUpperCase() || 'PENDIENTE',
            id_user: usuario.id_user // <-- IMPORTANTE para descarga
          }))
        );
        this.archivos = [...this.archivosOriginales];
        this.empleados = Array.from(new Set(usuarios.map((u: any) => u.nombre_usuario)));
      },
      error: (err) => {
        console.error('Error al obtener usuarios pendientes:', err);
      }
    });
  }

  aplicarFiltros(): void {
    this.archivos = this.archivosOriginales.filter(a => {
      const coincideEmpleado = this.filtroEmpleado ? a.usuario === this.filtroEmpleado : true;
      const coincideFecha = this.filtroFecha ? a.fecha.startsWith(this.filtroFecha) : true;
      return coincideEmpleado && coincideFecha;
    });
  }

  abrirModal(archivo: ArchivoPendiente): void {
    this.archivoSeleccionado = archivo;
    this.modalAbierto = true;
  }

  cerrarModal(): void {
    this.modalAbierto = false;
    this.archivoSeleccionado = null;
    this.accionSeleccionada = '';
    this.comentario = '';
    this.intentoGuardar = false;
  }

  /**
   * Descargar archivo Excel
   */
  descargarArchivo(id_user?: number): void {
    if (!id_user) return;

    this.gestionArchivosService.descargarArchivoUsuario(id_user).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `archivo_usuario_${id_user}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error al descargar archivo:', err);
      }
    });
  }

  /**
   * Guardar revisión del archivo
   */
  guardarRevision(): void {
    this.intentoGuardar = true;

    if (!this.archivoSeleccionado) return;

    if (this.accionSeleccionada === 'rechazar' && !this.comentario.trim()) {
      return; // obligatorio comentario en rechazo
    }

    if (this.accionSeleccionada === 'validar') {
      this.gestionArchivosService.validarArchivo(
        this.archivoSeleccionado.correo,
        this.archivoSeleccionado.nombre,
        this.comentario || ''
      ).subscribe({
        next: (resp) => {
          console.log('Archivo validado:', resp);
          this.cerrarModal();
          this.obtenerUsuariosPendientes();
        },
        error: (err) => {
          console.error('Error al validar archivo:', err);
        }
      });
    } else if (this.accionSeleccionada === 'rechazar') {
      this.gestionArchivosService.rechazarArchivo(
        1, // id del admin (puedes obtenerlo dinámico si lo manejas en auth)
        this.archivoSeleccionado.correo,
        this.comentario
      ).subscribe({
        next: (resp) => {
          console.log('Archivo rechazado:', resp);
          this.cerrarModal();
          this.obtenerUsuariosPendientes();
        },
        error: (err) => {
          console.error('Error al rechazar archivo:', err);
        }
      });
    }
  }
}
