import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SideNavAdminComponent } from '../../components/organims/Side-nav-admin/Side-nav-admin.component';

@Component({
  selector: 'app-admin',
  templateUrl: './Admin.component.html',
  standalone: true,
  imports: [
    RouterModule, 
    SideNavAdminComponent
  ]
})
export class AdminComponent {}
