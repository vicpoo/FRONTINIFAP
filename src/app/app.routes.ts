import { Routes } from '@angular/router';
import { LoginComponent } from './pages/Login/Login.component';
import { ListaUsuariosComponent } from './components/organims/Vistas-Admin/Lista-Usuarios/Lista-Usuarios.component';
import { AdminComponent } from './pages/Admin/Admin.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },

  {
    path: 'admin',
    component: AdminComponent, 
    children: [
      { path: 'lista-usuarios', component: ListaUsuariosComponent },
      
    ],
  },
];
