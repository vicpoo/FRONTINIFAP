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
  archivoExcel: File | null = null;
  nombreArchivo: string = '';
  mostrarModal: boolean = false;
  comentarioInvalido: string | null = null;

  constructor(
    private usuarioService: UsuarioRegistradoService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();

    if (user) {
      this.correoUsuario = user.correo;
      console.log('Correo del usuario logueado:', this.correoUsuario);
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

    if (f === 'pendiente') {
      this.cargarPendientes();
    } else if (f === 'validado') {
      this.cargarValidados();
    } else if (f === 'rechazado') {
      this.verificarComentario();
    }
  }

  get archivosFiltrados() {
    return this.archivos.filter(a => a.estatus === this.filtro);
  }

  irALogin(): void {
    this.router.navigate(['/login']);
  }

  cargarPendientes() {
    this.usuarioService.getPendientes(this.correoUsuario).subscribe({
      next: (res) => {
        const pendientes = res.archivos_pendientes?.map((a: any) => ({
          nombre: a.nombre_archivo,
          tipo: 'EXCEL',
          fecha: a.fecha_primer_registro,
          estatus: 'pendiente'
        })) || [];
        this.archivos = [...this.archivos, ...pendientes];
      },
      error: (err) => console.error(err)
    });
  }

  cargarValidados() {
    this.usuarioService.getValidados(this.correoUsuario).subscribe({
      next: (res) => {
        const validados = res.archivos_validados?.map((a: any) => ({
          nombre: a.nombre_archivo,
          tipo: 'EXCEL',
          fecha: a.fecha_primer_registro,
          estatus: 'validado'
        })) || [];
        this.archivos = [...this.archivos, ...validados];
      },
      error: (err) => console.error(err)
    });
  }

  verificarComentario() {
    this.usuarioService.verificarComentario(this.correoUsuario, 'verificar').subscribe({
      next: (res) => {
        if (res.comentario_invalido) {
          this.comentarioInvalido = res.comentario_invalido;
          this.archivos.push({
            nombre: 'Archivo con comentario',
            tipo: 'EXCEL',
            fecha: new Date().toISOString().split('T')[0],
            estatus: 'rechazado',
            comentario: res.comentario_invalido
          });
        } else {
          console.log('No hay comentarios inválidos');
        }
      },
      error: (err) => {
        if (err.status === 422) {
          console.log('Usuario sin comentarios inválidos');
        } else {
          console.error(err);
        }
      }
    });
  }

  onFileSelected(event: any) {
    this.archivoExcel = event.target.files[0];
    if (this.archivoExcel) {
      this.nombreArchivo = this.archivoExcel.name;
    }
  }

  subirArchivo() {
    if (this.archivoExcel) {
      this.usuarioService.uploadExcel(this.archivoExcel, this.correoUsuario).subscribe({
        next: (res) => {
          Swal.fire({
            title: '¡Éxito!',
            text: 'El archivo se subió correctamente',
            icon: 'success',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Aceptar'
          });
          this.cerrarModal();
          this.archivos = [];
          this.cargarPendientes();
          this.cargarValidados();
        },
        error: (err) => {
          Swal.fire({
            title: 'Error',
            text: 'Hubo un problema al subir el archivo',
            icon: 'error',
            confirmButtonColor: '#d33',
            confirmButtonText: 'Intentar de nuevo'
          });
          console.error(err);
        }
      });
    }
  }

  eliminarPendiente(nombreArchivo: string) {
    this.usuarioService.eliminarPendiente(this.correoUsuario, nombreArchivo).subscribe({
      next: (res) => {
        console.log('Pendiente eliminado', res);
        this.archivos = this.archivos.filter(a => a.nombre !== nombreArchivo);
      },
      error: (err) => console.error(err)
    });
  }
}
