import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Recomendacion {
  id: number;
  municipio: string;
  descripcion: string;
}

@Component({
  selector: 'app-recomendaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './Recomendaciones.component.html'
})
export class RecomendacionesComponent {
  recomendaciones: Recomendacion[] = [
    { id: 1, municipio: 'Tuxtla Gutierrez', descripcion: 'Ejemplo de recomendación...' },
    { id: 2, municipio: 'COITA', descripcion: 'Otra recomendación de ejemplo...' }
  ];
  recomendacionesFiltradas: Recomendacion[] = [...this.recomendaciones];

  filtroMunicipio: string = '';
  orden: string = 'recientes';

  modalAbierto = false;
  esNuevo = true;

  formRecomendacion: Recomendacion = { id: 0, municipio: '', descripcion: '' };

  municipios = [
    'Tuxtla Gutierrez',
    'San Cristóbal de las Casas',
    'Tapachula',
    'Comitán',
    'Ocosingo',
    'Palenque',
    'Tonala',
    'Villaflores',
    'Arriaga',
    'Chiapa de Corzo'
  ];

  aplicarFiltro() {
    let data = [...this.recomendaciones];
    if (this.filtroMunicipio.trim() !== '') {
      data = data.filter(r =>
        r.municipio.toLowerCase().includes(this.filtroMunicipio.toLowerCase())
      );
    }
    this.recomendacionesFiltradas = data;
  }

  abrirModal(rec?: Recomendacion) {
    this.modalAbierto = true;
    if (rec) {
      this.esNuevo = false;
      this.formRecomendacion = { ...rec };
    } else {
      this.esNuevo = true;
      this.formRecomendacion = { id: 0, municipio: '', descripcion: '' };
    }
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  eliminar(rec: Recomendacion) {
    console.log("Eliminar", rec);
  }
}
