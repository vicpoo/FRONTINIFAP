import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ArchivoPendiente {
  usuario: string;
  nombre: string;
  fecha: string;
  estatus: string;
}

@Component({
  selector: 'app-gestion-archivos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './Gestion-Archivos.component.html'
})
export class GestionArchivosComponent implements OnInit {
  empleados: string[] = ['Juan Pérez', 'Ana López', 'Carlos Ruiz'];
  archivos: ArchivoPendiente[] = [];
  archivosOriginales: ArchivoPendiente[] = [];

  filtroEmpleado: string = '';
  filtroFecha: string = '';

  ngOnInit(): void {
    // Datos de prueba
    this.archivosOriginales = [
      { usuario: 'Juan Pérez', nombre: 'informe1.pdf', fecha: '2025-08-01', estatus: 'PENDIENTE' },
      { usuario: 'Ana López', nombre: 'contrato.docx', fecha: '2025-08-03', estatus: 'PENDIENTE' },
      { usuario: 'Carlos Ruiz', nombre: 'planilla.xlsx', fecha: '2025-08-10', estatus: 'PENDIENTE' }
    ];

    // Copia inicial para mostrar en tabla
    this.archivos = [...this.archivosOriginales];
  }

  aplicarFiltros(): void {
    this.archivos = this.archivosOriginales.filter(a => {
      const coincideEmpleado = this.filtroEmpleado ? a.usuario === this.filtroEmpleado : true;
      const coincideFecha = this.filtroFecha ? a.fecha === this.filtroFecha : true;
      return coincideEmpleado && coincideFecha;
    });
  }
}
