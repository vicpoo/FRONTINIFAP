import { Component, OnInit } from '@angular/core';
import { CommonModule, NgForOf, NgClass } from '@angular/common';
import { UsuarioRegistradoService } from '../../Service/UsuarioRegistrado.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Archivo } from '../../Interface/Archivo';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [CommonModule, NgForOf, NgClass, FormsModule],
  templateUrl: './usuario.component.html'
})
export class UsuarioComponent implements OnInit {
  archivos: Archivo[] = [];
  filtro: 'pendiente' | 'validado' | 'rechazado' = 'pendiente';

  correoUsuario = '';
  userId: number | null = null;   // 👈 Nuevo campo para manejar ID
  archivoExcel: File | null = null;
  nombreArchivo: string = '';
  mostrarModal: boolean = false;
  tipoAnalisis: 'quimico' | 'suelo' = 'quimico';

  constructor(
    private usuarioService: UsuarioRegistradoService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();

    if (user) {
      this.correoUsuario = user.correo;
      this.userId = user.id;  // 👈 Guardamos el ID
      console.log('Correo del usuario logueado:', this.correoUsuario);
      console.log('ID del usuario logueado:', this.userId);
      this.setFiltro('pendiente');
    } else {
      console.warn('No se encontró información del usuario, redirigiendo al login...');
      this.router.navigate(['/login']);
    }
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.archivoExcel = null;
    this.nombreArchivo = '';
  }

  setFiltro(f: 'pendiente' | 'validado' | 'rechazado') {
    this.filtro = f;
    this.archivos = [];
    this.cargarArchivos();
  }

  get archivosFiltrados() {
    return this.archivos.filter(
      a => a.estatus === this.filtro && a.tipo === this.tipoAnalisis
    );
  }

  irALogin(): void {
    this.router.navigate(['/login']);
  }

  cargarArchivos() {
    if (this.filtro === 'pendiente') {
      this.cargarPendientes();
    } else if (this.filtro === 'validado') {
      this.cargarValidados();
    } else if (this.filtro === 'rechazado') {
      this.cargarComentariosInvalidos();
    }
  }

  cargarPendientes() {
    this.archivos = [];

    // Pendientes Químicos (correo)
    this.usuarioService.getPendientes(this.correoUsuario).subscribe({
      next: (res) => {
        const pendientesQuimicos = res.archivos_pendientes?.map((a: any) => ({
          nombre: a.nombre_archivo,
          tipo: 'quimico',
          fecha: a.fecha_primer_registro,
          estatus: 'pendiente'
        })) || [];
        this.archivos = [...this.archivos, ...pendientesQuimicos];
      },
      error: (err) => console.error('Error pendientes químicos:', err)
    });

    // Pendientes Suelo (userId)
    if (this.userId) {
      this.usuarioService.getPendientesSuelo(this.userId).subscribe({
        next: (res) => {
          const pendientesSuelo = res.archivos_pendientes?.map((a: any) => ({
            nombre: a.nombre_archivo,
            tipo: 'suelo',
            fecha: a.fecha_primer_registro,
            estatus: 'pendiente'
          })) || [];
          this.archivos = [...this.archivos, ...pendientesSuelo];
        },
        error: (err) => console.error('Error pendientes suelo:', err)
      });
    }
  }

  cargarValidados() {
    this.archivos = [];

    // Validados Químicos (correo)
    this.usuarioService.getValidados(this.correoUsuario).subscribe({
      next: (res) => {
        const validadosQuimicos = res.archivos_validados?.map((a: any) => ({
          nombre: a.nombre_archivo,
          tipo: 'quimico',
          fecha: a.fecha_primer_registro,
          estatus: 'validado'
        })) || [];
        this.archivos = [...this.archivos, ...validadosQuimicos];
      },
      error: (err) => console.error('Error validados químicos:', err)
    });

    // Validados Suelo (userId)
    if (this.userId) {
      this.usuarioService.getValidadosSuelo(this.userId).subscribe({
        next: (res) => {
          const validadosSuelo = res.archivos_validados?.map((a: any) => ({
            nombre: a.nombre_archivo,
            tipo: 'suelo',
            fecha: a.fecha_primer_registro,
            estatus: 'validado'
          })) || [];
          this.archivos = [...this.archivos, ...validadosSuelo];
        },
        error: (err) => console.error('Error validados suelo:', err)
      });
    }
  }

  cargarComentariosInvalidos() {
    if (this.userId) {
      this.usuarioService.getComentariosInvalidos(this.correoUsuario).subscribe({
        next: (res) => {
          console.log('Respuesta del backend:', res);

          const rechazados = res.registros_detalles?.map((registro: any) => ({
            nombre: registro.nombre_archivo || 'Archivo desconocido',
            tipo: 'suelo',
            fecha: registro.fecha || new Date().toISOString().split('T')[0],
            estatus: 'rechazado',
            comentario: registro.observacion || 'Sin comentario'
          })) || [];

          this.archivos = [...rechazados];
        },
        error: (err) => {
          console.error('Error al obtener comentarios inválidos:', err);
        }
      });
    }
  }

  onFileSelected(event: any) {
    this.archivoExcel = event.target.files[0];
    if (this.archivoExcel) {
      this.nombreArchivo = this.archivoExcel.name;
    }
  }

  subirArchivo() {
    if (!this.archivoExcel) {
      Swal.fire('Error', 'Debe seleccionar un archivo para subir', 'error');
      return;
    }

    const uploadObservable =
      this.tipoAnalisis === 'quimico'
        ? this.usuarioService.uploadExcel(this.archivoExcel, this.correoUsuario)
        : this.usuarioService.uploadExcelSuelo(this.archivoExcel, this.userId!); // 👈 ahora con userId

    uploadObservable.subscribe({
      next: () => {
        Swal.fire('¡Éxito!', 'El archivo se subió correctamente', 'success');
        this.cerrarModal();
        this.archivos = [];
        this.cargarArchivos();
      },
      error: (err) => {
        Swal.fire('Error', 'Hubo un problema al subir el archivo', 'error');
        console.error(err);
      },
    });
  }

  eliminarPendiente(nombreArchivo: string) {
    // 👀 Aquí supongo que solo aplica a químicos (correo), si necesitas también para suelo dime
    this.usuarioService.eliminarPendiente(this.correoUsuario, nombreArchivo).subscribe({
      next: (res) => {
        console.log('Pendiente eliminado', res);
        this.archivos = this.archivos.filter(a => a.nombre !== nombreArchivo);
      },
      error: (err) => console.error(err)
    });
  }
}
