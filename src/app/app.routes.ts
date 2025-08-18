import { Routes } from '@angular/router';
import { LoginComponent } from './pages/Login/Login.component';
import { ListaUsuariosComponent } from './components/organims/Admin/Lista-Usuarios/Lista-Usuarios.component';

export const routes: Routes = [

    { path: '', component: LoginComponent,},
     { path: 'Lista-Usuarios', component: ListaUsuariosComponent,},
];
