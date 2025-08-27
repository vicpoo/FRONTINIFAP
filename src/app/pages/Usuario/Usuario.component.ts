import { Component, OnInit } from '@angular/core';
import { CommonModule, NgForOf, NgClass } from '@angular/common';
import { UsuarioRegistradoService } from '../../Service/UsuarioRegistrado.service';
import { Router, ActivatedRoute } from '@angular/router';

interface Archivo {
  nombre: string;
  tipo: string;
  fecha: string;
  estatus: 'pendiente' | 'validado' | 'rechazado';
  comentario?: string; // solo para rechazados
}

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [CommonModule, NgForOf, NgClass],
  templateUrl: './usuario.component.html'
})
export class UsuarioComponent implements OnInit {
  archivos: Archivo[] = [];
  filtro: 'pendiente' | 'validado' | 'rechazado' = 'pendiente';

  correoUsuario = 'Denzel@gmail.com'; 
  archivoExcel: File | null = null;
  comentarioInvalido: string | null = null;

  constructor(private usuarioService: UsuarioRegistradoService, private router: Router,) {
    
  }

  ngOnInit(): void {
  this.setFiltro('pendiente'); // Solo pendientes al inicio
}


  // Cambiar filtro
 setFiltro(f: 'pendiente' | 'validado' | 'rechazado') {
  this.filtro = f;

  // Limpiar la lista al cambiar de vista para evitar duplicados
  this.archivos = [];

  if (f === 'pendiente') {
    this.cargarPendientes();
  } else if (f === 'validado') {
    this.cargarValidados();
  } else if (f === 'rechazado') {
    this.verificarComentario();
  }
}


  // Obtener lista combinada filtrada
  get archivosFiltrados() {
    return this.archivos.filter(a => a.estatus === this.filtro);
  }

  irALogin(): void {
    this.router.navigate(['/login']);
  }

  // Cargar pendientes desde API
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

  // Cargar validados desde API
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

  // Verificar si hay comentarios de rechazo
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


  // Subir archivo Excel
  onFileSelected(event: any) {
    this.archivoExcel = event.target.files[0];
  }

  subirArchivo() {
    if (this.archivoExcel) {
      this.usuarioService.uploadExcel(this.archivoExcel, this.correoUsuario).subscribe({
        next: (res) => {
          console.log('Archivo subido', res);
          this.archivos = [];
          this.cargarPendientes();
          this.cargarValidados();
        },
        error: (err) => console.error(err)
      });
    }
  }

  // Eliminar pendiente
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
