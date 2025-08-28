import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GestionArchivosAdminService } from '../../../../Service/gestion-archivos-admin.service';
import { ArchivoPendiente } from '../../../../Interface/ArchivoPendiente';


@Component({
  selector: 'app-gestion-archivos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './Gestion-Archivos.component.html'
})
export class GestionArchivosComponent implements OnInit {

  // --- Control de vista ---
  vistaActual: 'quimicos' | 'suelos' = 'quimicos';

  // --- Datos de archivos ---
  archivosQuimicos: ArchivoPendiente[] = [];
  archivosQuimicosOriginal: ArchivoPendiente[] = [];

  archivosSuelos: ArchivoPendiente[] = [];
  archivosSuelosOriginal: ArchivoPendiente[] = [];

  // --- Filtros ---
  empleados: string[] = [];
  filtroEmpleado: string = '';
  filtroFecha: string = '';

  // --- Modal ---
  modalAbierto: boolean = false;
  archivoSeleccionado: ArchivoPendiente | null = null;
  tipoSeleccionado: 'quimicos' | 'suelos' = 'quimicos';
  accionSeleccionada: string = '';
  comentario: string = '';
  intentoGuardar: boolean = false;

  constructor(private gestionArchivosService: GestionArchivosAdminService) {}

  ngOnInit(): void {
    this.obtenerUsuariosPendientes();
  }

  // ===============================
  // OBTENER LISTAS
  // ===============================
  obtenerUsuariosPendientes(): void {
    // --- Analisis Químicos ---
    this.gestionArchivosService.getUsuariosConPendientes().subscribe({
      next: (data) => {
        const usuarios = data?.usuarios || [];
        this.archivosQuimicosOriginal = usuarios.flatMap((usuario: any) =>
          (usuario.nombres_archivos || []).map((archivo: string) => ({
            usuario: usuario.nombre_usuario,
            correo: usuario.correo,
            nombre: archivo,
            fecha: usuario.fecha_creacion,
            estatus: usuario.estatus?.toUpperCase() || 'PENDIENTE',
            id_user: usuario.user_id
          }))
        );
        this.archivosQuimicos = [...this.archivosQuimicosOriginal];
        this.actualizarListaEmpleados();
      },
      error: (err) => {
        console.error('Error al obtener usuarios pendientes (químicos):', err);
      }
    });

    // --- Analisis Suelos ---
    this.gestionArchivosService.getUsuariosConPendientesSuelo().subscribe({
      next: (data) => {
        const usuarios = data?.usuarios || [];
        this.archivosSuelosOriginal = usuarios.flatMap((usuario: any) =>
          (usuario.nombres_archivos || []).map((archivo: string) => ({
            usuario: usuario.nombre_usuario,
            correo: usuario.correo,
            nombre: archivo,
            fecha: usuario.fecha_creacion,
            estatus: usuario.estatus?.toUpperCase() || 'PENDIENTE',
            id_user: usuario.user_id
          }))
        );
        this.archivosSuelos = [...this.archivosSuelosOriginal];
        this.actualizarListaEmpleados();
      },
      error: (err) => {
        console.error('Error al obtener usuarios pendientes (suelos):', err);
      }
    });
  }

  actualizarListaEmpleados(): void {
    const todosEmpleados = [
      ...this.archivosQuimicosOriginal.map(a => a.usuario),
      ...this.archivosSuelosOriginal.map(a => a.usuario)
    ];
    this.empleados = Array.from(new Set(todosEmpleados));
  }

  // ===============================
  // FILTROS
  // ===============================
  aplicarFiltros(): void {
    if (this.vistaActual === 'quimicos') {
      this.archivosQuimicos = this.archivosQuimicosOriginal.filter(a => {
        const coincideEmpleado = this.filtroEmpleado ? a.usuario === this.filtroEmpleado : true;
        const coincideFecha = this.filtroFecha ? a.fecha.startsWith(this.filtroFecha) : true;
        return coincideEmpleado && coincideFecha;
      });
    } else {
      this.archivosSuelos = this.archivosSuelosOriginal.filter(a => {
        const coincideEmpleado = this.filtroEmpleado ? a.usuario === this.filtroEmpleado : true;
        const coincideFecha = this.filtroFecha ? a.fecha.startsWith(this.filtroFecha) : true;
        return coincideEmpleado && coincideFecha;
      });
    }
  }

  // ===============================
  // MODAL
  // ===============================
  abrirModal(archivo: ArchivoPendiente, tipo: 'quimicos' | 'suelos'): void {
    this.archivoSeleccionado = archivo;
    this.tipoSeleccionado = tipo;
    this.modalAbierto = true;
  }

  cerrarModal(): void {
    this.modalAbierto = false;
    this.archivoSeleccionado = null;
    this.accionSeleccionada = '';
    this.comentario = '';
    this.intentoGuardar = false;
  }

  // ===============================
  // DESCARGA
  // ===============================
  descargarArchivo(userId?: number, tipo?: 'quimicos' | 'suelos'): void {
    if (!userId) {
      console.error('No se encontró el userId');
      return;
    }

    const download$ =
      tipo === 'quimicos'
        ? this.gestionArchivosService.descargarArchivo(userId)
        : this.gestionArchivosService.descargarArchivoSuelo(userId);

    download$.subscribe({
      next: (data: Blob) => {
        const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `usuario_${userId}_${tipo}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error al descargar archivo:', err);
      }
    });
  }

  // ===============================
  // GUARDAR REVISIÓN
  // ===============================
  guardarRevision(): void {
    this.intentoGuardar = true;

    if (!this.archivoSeleccionado) return;
    if (this.accionSeleccionada === 'rechazar' && !this.comentario.trim()) return;

    const correo = this.archivoSeleccionado.correo;
    const archivo = this.archivoSeleccionado.nombre;
    const comentario = this.comentario;

    const request$ =
      this.accionSeleccionada === 'validar'
        ? (this.tipoSeleccionado === 'quimicos'
            ? this.gestionArchivosService.validarArchivo(correo, archivo, comentario)
            : this.gestionArchivosService.validarArchivoSuelo(correo, archivo, comentario))
        : (this.tipoSeleccionado === 'quimicos'
            ? this.gestionArchivosService.rechazarArchivo(1, correo, comentario)
            : this.gestionArchivosService.rechazarArchivoSuelo(1, correo, comentario));

    request$.subscribe({
      next: (resp) => {
        console.log('Respuesta:', resp);
        this.cerrarModal();
        this.obtenerUsuariosPendientes();
      },
      error: (err) => {
        console.error('Error al procesar archivo:', err);
      }
    });
  }
}
