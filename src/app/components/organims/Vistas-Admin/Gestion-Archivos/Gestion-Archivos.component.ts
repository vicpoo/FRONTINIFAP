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

  
  vistaActual: 'quimicos' = 'quimicos';

  archivosQuimicos: ArchivoPendiente[] = [];
  archivosQuimicosOriginal: ArchivoPendiente[] = [];


  empleados: string[] = [];
  filtroEmpleado: string = '';
  filtroFecha: string = '';

  modalAbierto: boolean = false;
  archivoSeleccionado: ArchivoPendiente | null = null;
  tipoSeleccionado: 'quimicos' = 'quimicos';
  accionSeleccionada: string = '';
  comentario: string = '';
  intentoGuardar: boolean = false;

  constructor(private gestionArchivosService: GestionArchivosAdminService) {}

  ngOnInit(): void {
    this.obtenerUsuariosPendientes();
  }

  // ===============================
  // OBTENER LISTAS (SOLO QUÍMICOS)
  // ===============================
  obtenerUsuariosPendientes(): void {
    this.gestionArchivosService.getUsuariosConPendientes().subscribe({
      next: (data) => {
        const usuarios = data?.usuarios || [];
        this.archivosQuimicosOriginal = usuarios.flatMap((usuario: any) =>
          (usuario.nombres_archivos || []).map((archivo: string) => ({
            usuario: usuario.nombre_usuario,
            correo: usuario.correo,
            nombre: archivo,
            fecha: usuario.fecha_creacion,
            estatus: (usuario.estatus || 'PENDIENTE').toString().toUpperCase(),
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
  }

  actualizarListaEmpleados(): void {
    const todosEmpleados = this.archivosQuimicosOriginal.map(a => a.usuario);
    this.empleados = Array.from(new Set(todosEmpleados));
  }

  // ===============================
  // FILTROS (SOLO QUÍMICOS)
  // ===============================
  aplicarFiltros(): void {
    // Solo aplica filtros sobre la lista de químicos
    this.archivosQuimicos = this.archivosQuimicosOriginal.filter(a => {
      const coincideEmpleado = this.filtroEmpleado ? a.usuario === this.filtroEmpleado : true;
      const coincideFecha = this.filtroFecha ? a.fecha.startsWith(this.filtroFecha) : true;
      return coincideEmpleado && coincideFecha;
    });
  }

  // ===============================
  // MODAL
  // ===============================
  abrirModal(archivo: ArchivoPendiente, tipo?: 'quimicos'): void {
    // ignoramos tipo entrante y forzamos 'quimicos'
    this.archivoSeleccionado = archivo;
    this.tipoSeleccionado = 'quimicos';
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
  // DESCARGA (SOLO QUÍMICOS)
  // ===============================
  descargarArchivo(userId?: number): void {
    if (!userId) {
      console.error('No se encontró el userId');
      return;
    }

    const download$ = this.gestionArchivosService.descargarArchivo(userId);

    download$.subscribe({
      next: (data: Blob) => {
        const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `usuario_${userId}_quimicos.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error al descargar archivo:', err);
      }
    });
  }

  // ===============================
  // GUARDAR REVISIÓN (SOLO QUÍMICOS)
  // ===============================
  guardarRevision(): void {
    this.intentoGuardar = true;

    if (!this.archivoSeleccionado) return;
    if (this.accionSeleccionada === 'rechazar' && !this.comentario.trim()) return;

    const correo = this.archivoSeleccionado.correo;
    const archivo = this.archivoSeleccionado.nombre;
    const comentario = this.comentario;

    // Sólo usamos las APIs de químicos
    const request$ =
      this.accionSeleccionada === 'validar'
        ? this.gestionArchivosService.validarArchivo(correo, archivo, comentario)
        : this.gestionArchivosService.rechazarArchivo(1, correo, comentario);

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
