import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { SideNavAdminComponent } from '../../Side-nav-admin/Side-nav-admin.component';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, SideNavAdminComponent],
  templateUrl: './Lista-Usuarios.component.html'
})
export class ListaUsuariosComponent {
  usuarios = [
    { nombre: 'MANUEL', correo: 'Manu@g.com', contrasena: '' },
    { nombre: 'MARIO', correo: 'Mario@g.com', contrasena: '' },
    { nombre: 'MAX', correo: 'Max@g.com', contrasena: '' },
  ];

  modalAbierto = false;
  esNuevoUsuario = true;
  usuarioSeleccionado: any = { nombre: '', correo: '', contrasena: '' };

  abrirAgregar() {
    this.esNuevoUsuario = true;
    this.usuarioSeleccionado = { nombre: '', correo: '', contrasena: '' };
    this.modalAbierto = true;
  }

  abrirEditar(usuario: any) {
    this.esNuevoUsuario = false;
    this.usuarioSeleccionado = { ...usuario };
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  guardarCambios() {
    if (this.esNuevoUsuario) {
      this.usuarios.push({ ...this.usuarioSeleccionado });
    } else {
      const index = this.usuarios.findIndex(u => u.correo === this.usuarioSeleccionado.correo);
      if (index > -1) {
        this.usuarios[index] = { ...this.usuarioSeleccionado };
      }
    }
    this.cerrarModal();
  }
}
