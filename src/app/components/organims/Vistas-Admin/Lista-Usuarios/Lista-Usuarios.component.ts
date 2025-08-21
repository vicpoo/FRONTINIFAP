import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from '../../../../Service/Usuarios.service';
import { Usuario } from '../../../../Interface/Usuario.model';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './Lista-Usuarios.component.html'
})
export class ListaUsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  modalAbierto = false;
  esNuevoUsuario = true;

  usuarioSeleccionado: Usuario = {
    nombre: '',
    apellido: '',
    correo: '',
    numero_telefonico: '',
    password: '',
    rol_id_FK: 1
  };

  constructor(
    private usuariosService: UsuariosService,
    private cdRef: ChangeDetectorRef   // 👈 inyectamos ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.usuariosService.getUsuarios().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.cdRef.detectChanges(); // 👈 fuerza refresco de la vista
      },
      error: (err) => console.error('❌ Error cargando usuarios:', err)
    });
  }

  abrirAgregar() {
    this.esNuevoUsuario = true;
    this.usuarioSeleccionado = {
      nombre: '',
      apellido: '',
      correo: '',
      numero_telefonico: '',
      password: '',
      rol_id_FK: 1
    };
    this.modalAbierto = true;
    this.cdRef.detectChanges(); // 👈 asegura refresco al abrir modal
  }

  abrirEditar(usuario: Usuario) {
    this.esNuevoUsuario = false;
    this.usuarioSeleccionado = { ...usuario };
    this.modalAbierto = true;
    this.cdRef.detectChanges();
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.cdRef.detectChanges();
  }

  guardarCambios() {
    if (this.esNuevoUsuario) {
      this.usuariosService.addUsuario(this.usuarioSeleccionado).subscribe({
        next: () => {
          this.cargarUsuarios();
          this.cerrarModal();
        },
        error: (err) => console.error('❌ Error agregando usuario:', err)
      });
    } else {
      this.usuariosService.updateUsuario(this.usuarioSeleccionado).subscribe({
        next: () => {
          this.cargarUsuarios();
          this.cerrarModal();
        },
        error: (err) => console.error('❌ Error editando usuario:', err)
      });
    }
  }

  eliminarUsuario(usuario: Usuario) {
    if (usuario.id_user) {
      this.usuariosService.deleteUsuario(usuario.id_user).subscribe({
        next: () => {
          this.cargarUsuarios();
        },
        error: (err) => console.error('❌ Error eliminando usuario:', err)
      });
    }
  }
}
