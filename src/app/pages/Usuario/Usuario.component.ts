import { Component, OnInit } from '@angular/core';
import { CommonModule, NgForOf, NgClass } from '@angular/common';

interface Archivo {
  nombre: string;
  tipo: string;
  fecha: string;
  estatus: 'pendiente' | 'validado' | 'rechazado';
}

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [CommonModule, NgForOf, NgClass],
  templateUrl: './usuario.component.html'
})
export class UsuarioComponent implements OnInit {
  archivos: Archivo[] = [];
  filtro: 'pendiente' | 'validado' | 'rechazado' = 'pendiente';

  ngOnInit(): void {

    this.archivos = [
      { nombre: 'Analisis de Suelo', tipo: 'EXCEL', fecha: '15-08-2025', estatus: 'pendiente' },
      { nombre: 'Informe de Agua', tipo: 'PDF', fecha: '10-08-2025', estatus: 'validado' },
      { nombre: 'Reporte Mensual', tipo: 'DOCX', fecha: '05-08-2025', estatus: 'rechazado' }
    ];
  }

  setFiltro(f: 'pendiente' | 'validado' | 'rechazado') {
    this.filtro = f;
  }

  get archivosFiltrados() {
    return this.archivos.filter(a => a.estatus === this.filtro);
  }
}
