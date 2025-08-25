//app.routes.ts
import { Routes } from '@angular/router';
import { ListaUsuariosComponent } from './components/organims/Vistas-Admin/Lista-Usuarios/Lista-Usuarios.component';
import { AdminComponent } from './pages/Admin/Admin.component';
import { HomeComponent } from './pages/Home/home.component';
import { GestionArchivosComponent } from './components/organims/Vistas-Admin/Gestion-Archivos/Gestion-Archivos.component';
import { RecomendacionesComponent } from './components/organims/Vistas-Admin/Recomendaciones/Recomendaciones.component';
import { UsuarioComponent } from './pages/Usuario/Usuario.component';
import { LoginComponent } from './pages/Login/Login.component';
import { RecomendacionesNutricionalesComponent } from './components/organims/Vistas-Mapa/Recomendaciones/recomendaciones-nutricionales.component';

export const routes: Routes = [
  { path: 'login', component:LoginComponent},
  { path: '', component: HomeComponent},
  { path: 'Usuario', component: UsuarioComponent},
  { path: 'nutricionales/:id', component: RecomendacionesNutricionalesComponent},
  {
    path: 'admin',
    component: AdminComponent, 
    children: [
      { path: 'lista-usuarios', component: ListaUsuariosComponent },
      { path: 'Gestion-Archivos', component: GestionArchivosComponent },
      { path: 'Recomendaciones', component: RecomendacionesComponent },      
    ],
  },
];
