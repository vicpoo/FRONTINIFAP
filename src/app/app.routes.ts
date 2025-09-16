// app.routes.ts
import { Routes } from '@angular/router';
import { ListaUsuariosComponent } from './components/organims/Vistas-Admin/Lista-Usuarios/Lista-Usuarios.component';
import { AdminComponent } from './pages/Admin/Admin.component';
import { HomeComponent } from './pages/Home/home.component';
import { GestionArchivosComponent } from './components/organims/Vistas-Admin/Gestion-Archivos/Gestion-Archivos.component';
import { RecomendacionesComponent } from './components/organims/Vistas-Admin/Recomendaciones/Recomendaciones.component';
import { UsuarioComponent } from './pages/Usuario/Usuario.component';
import { LoginComponent } from './pages/Login/Login.component';
import { RecomendacionesNutricionalesComponent } from './components/organims/Vistas-Mapa/Recomendaciones/recomendaciones-nutricionales.component';
import { AuthGuard } from './auth/auth.guard';
import { AdminGuard } from './auth/admin.guard';
import { PortadaComponent } from './pages/Portada/Portada.component';
import { ClasificacionComponent } from './components/organims/Vistas-Admin/Clasificacion-resultados/Clasificacion.component';
import { AnalisisComponent } from './components/organims/Vistas-Mapa/Analisis/analisis.component';

export const routes: Routes = [
  { path: '', component: PortadaComponent},
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { 
    path: 'nutricionales/:id', 
    component: RecomendacionesNutricionalesComponent
  },
  {
  path: 'analisis/:id',
  component: AnalisisComponent
  },
  { 
    path: 'Usuario', 
    component: UsuarioComponent,
    canActivate: [AuthGuard],
    data: { expectedRole: 2 } 
  },
    {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard, AdminGuard],
    children: [
      { path: 'lista-usuarios', component: ListaUsuariosComponent },
      { path: 'Gestion-Archivos', component: GestionArchivosComponent },
      { path: 'Recomendaciones', component: RecomendacionesComponent },
      { path: 'Clasificacion', component: ClasificacionComponent},
      { path: '', redirectTo: 'lista-usuarios', pathMatch: 'full' }
    ]
  },
  
  { path: '**', redirectTo: 'login' }
];