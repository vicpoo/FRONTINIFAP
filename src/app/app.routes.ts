import { Routes } from '@angular/router';
import { LoginComponent } from './pages/Login/Login.component';
import { ListaUsuariosComponent } from './components/organims/Admin/Lista-Usuarios/Lista-Usuarios.component';
import { HomeComponent } from './pages/Home/home.component';

export const routes: Routes = [

    { path: '', component: HomeComponent},
    { path: 'Login', component: LoginComponent},
    { path: 'Lista-Usuarios', component: ListaUsuariosComponent},
];
