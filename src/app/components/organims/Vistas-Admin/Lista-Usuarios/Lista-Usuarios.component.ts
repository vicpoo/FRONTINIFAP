import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService, Usuario } from '../../../../Service/Usuarios.service';

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

  // usuario con todos los campos que espera la API
  usuarioSeleccionado: Usuario = {
    nombre: '',
    apellido: '',
    correo: '',
    numero_telefonico: '',
    password: '',
    rol_id_FK: 1
  };

  constructor(private usuariosService: UsuariosService) {}

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.usuariosService.getUsuarios().subscribe({
      next: (data) => this.usuarios = data,
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
  }

  abrirEditar(usuario: Usuario) {
    this.esNuevoUsuario = false;
    this.usuarioSeleccionado = { ...usuario };
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  guardarCambios() {
    if (this.esNuevoUsuario) {
      this.usuariosService.addUsuario(this.usuarioSeleccionado).subscribe({
        next: () => this.cargarUsuarios(),
        error: (err) => console.error('❌ Error agregando usuario:', err)
      });
    } else {
      this.usuariosService.updateUsuario(this.usuarioSeleccionado).subscribe({
        next: () => this.cargarUsuarios(),
        error: (err) => console.error('❌ Error editando usuario:', err)
      });
    }
    this.cerrarModal();
  }

  eliminarUsuario(usuario: Usuario) {
    if (usuario.id_user) {
      this.usuariosService.deleteUsuario(usuario.id_user).subscribe({
        next: () => this.cargarUsuarios(),
        error: (err) => console.error('❌ Error eliminando usuario:', err)
      });
    }
  }
}
