// home.component.ts - VERSIÓN FINAL CON API
import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { MunicipiosService, Municipio } from '../../Service/municipios.service';

// Importaciones de OpenLayers
import OLMap from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { Style, Stroke, Fill } from 'ol/style';
import { fromLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import Overlay from 'ol/Overlay';
import Geometry from 'ol/geom/Geometry';
import Polygon from 'ol/geom/Polygon';
import type { FeatureLike } from 'ol/Feature';
import type { StyleFunction } from 'ol/style/Style';
import { defaults as defaultControls } from 'ol/control';
import { defaults as defaultInteractions } from 'ol/interaction';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [MunicipiosService]
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
  @ViewChild('tooltip', { static: false }) tooltip!: ElementRef;
  
  municipioBuscado: string = '';
  municipioSeleccionado: string = '';
  municipiosFiltrados: Municipio[] = [];
  municipios: Municipio[] = [];
  mapaInicializado: boolean = false;
  porcentajeCarga: number = 0;
  mensajeCarga: string = 'Inicializando...';
  
  private map!: OLMap;
  private vectorLayer!: VectorLayer<VectorSource>;
  private vectorSource!: VectorSource;
  private tooltipOverlay!: Overlay;
  private hoverFeature: Feature<Geometry> | null = null;
  private selectFeature: Feature<Geometry> | null = null;
  private labelOverlay!: Overlay;
  private labelElement!: HTMLElement;
  
  // Cache optimizado
  private readonly styleCache = new Map<string, Style>();
  private readonly featureNameCache = new Map<Feature<Geometry>, string>();
  private readonly municipioColorMap = new Map<string, string>();
  
  // Colores predefinidos para todos los municipios
  private readonly COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
    '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA', '#F1948A', '#AED6F1', '#A9DFBF', '#F9E79F',
    '#F5B7B1', '#D2B4DE', '#A9CCE3', '#A3E4D7', '#F9E79F', '#FAD7A0', '#D7BDE2', '#A9DFDF',
    '#F8C471', '#F5CBA7', '#D6EAF8', '#D1F2EB', '#FDEBD0', '#E8DAEF', '#D6DBDF', '#D0ECE7',
    '#FCF3CF', '#FADBD8', '#D4E6F1', '#D1F2EB', '#FDEDEC', '#E8F8F5', '#FEF9E7', '#F4ECF7',
    '#EBF5FB', '#E8F8F5', '#FEF5E7', '#FDEDEC', '#F4F6F6', '#EAFAF1', '#FDF2E9', '#F8F9F9',
    '#EAF2F8', '#E8F6F3', '#FDEBD0', '#F6DDCC', '#D6EAF8', '#D1F2EB', '#F9E79F', '#FAD7A0',
    '#D7BDE2', '#A9DFDF', '#F8C471', '#F5CBA7', '#D6EAF8', '#D1F2EB', '#FDEBD0', '#E8DAEF',
    '#FF9999', '#99FF99', '#9999FF', '#FFFF99', '#FF99FF', '#99FFFF', '#FFCC99', '#CCFF99',
    '#99CCFF', '#FF99CC', '#CC99FF', '#99FFCC', '#FFCC66', '#CCFF66', '#66CCFF', '#FF66CC'
  ];

  constructor(
    private router: Router, 
    private http: HttpClient, 
    private cdr: ChangeDetectorRef,
    private municipiosService: MunicipiosService
  ) {}

  ngOnInit(): void {
    this.loadMunicipiosFromAPI();
  }

  ngAfterViewInit(): void {
    // Esperamos a que los municipios se carguen antes de inicializar el mapa
    setTimeout(() => {
      this.initMapImmediate();
    }, 100);
  }

  ngOnDestroy(): void {
    this.cleanupResources();
  }

  // CARGAR MUNICIPIOS DESDE LA API
  private loadMunicipiosFromAPI(): void {
    this.updateProgress(10, 'Cargando municipios desde API...');
    
    this.municipiosService.getMunicipios().subscribe({
      next: (municipios: Municipio[]) => {
        this.municipios = municipios;
        this.municipiosFiltrados = [...municipios];
        this.initializeMunicipioColors();
        this.updateProgress(30, 'Municipios cargados correctamente');
        console.log('Municipios cargados:', municipios.length);
        
        // Debug: mostrar nombres de municipios para comparación
        console.log('Nombres en API:', municipios.map(m => `"${m.nombre}"`).sort());
      },
      error: (error) => {
        console.error('Error cargando municipios:', error);
        this.loadFallbackMunicipios();
        this.updateProgress(30, 'Usando datos de respaldo');
      }
    });
  }

  // DATOS DE RESPALDO EN CASO DE ERROR DE API
  private loadFallbackMunicipios(): void {
    const fallbackNames = [
      'Acacoyagua', 'Acala', 'Acapetahua', 'Aldama', 'Altamirano', 'Amatán',
      'Amatenango de la Frontera', 'Amatenango del Valle', 'Angel Albino Corzo',
      'Arriaga', 'Bejucal de Ocampo', 'Bella Vista', 'Benemérito de las Américas',
      'Berriozábal', 'Bochil', 'El Bosque', 'Cacahoatán', 'Catazajá',
      'Chalchihuitán', 'Chamula', 'Chanal', 'Chapultenango', 'Chenalhó',
      'Chiapa de Corzo', 'Chiapilla', 'Chicoasén', 'Chicomuselo', 'Chilón',
      'Cintalapa', 'Coapilla', 'Comitán de Domínguez', 'La Concordia', 'Copainalá',
      'El Porvenir', 'Escuintla', 'Francisco León', 'Frontera Comalapa',
      'Frontera Hidalgo', 'La Grandeza', 'Huehuetán', 'Huitiupán', 'Huixtán',
      'Huixtla', 'Ixhuatán', 'Ixtacomitán', 'Ixtapa', 'Ixtapangajoya',
      'Jiquipilas', 'Jitotol', 'Juárez', 'Larráinzar', 'La Libertad',
      'Mapastepec', 'Las Margaritas', 'Mazapa de Madero', 'Mazatán', 'Metapa',
      'Mitontic', 'Montecristo de Guerrero', 'Motozintla', 'Nicolás Ruíz',
      'Ocosingo', 'Ocotepec', 'Ocozocoautla de Espinosa', 'Ostuacán',
      'Osumacinta', 'Oxchuc', 'Palenque', 'Pantelhó', 'Pantepec', 'Pichucalco',
      'Pijijiapan', 'Pueblo Nuevo Solistahuacán', 'Rayón', 'Reforma', 'Las Rosas',
      'Sabanilla', 'Salto de Agua', 'San Andrés Duraznal', 'San Cristóbal de las Casas',
      'San Fernando', 'San Juan Cancuc', 'San Lucas', 'Santiago el Pinar',
      'Siltepec', 'Simojovel', 'Sitalá', 'Socoltenango', 'Solosuchiapa',
      'Soyaló', 'Suchiapa', 'Suchiate', 'Sunuapa', 'Tapachula', 'Tapalapa',
      'Tapilula', 'Tecpatán', 'Tenejapa', 'Teopisca', 'Tila', 'Tonalá',
      'Totolapa', 'La Trinitaria', 'Tumbalá', 'Tuxtla Gutiérrez', 'Tuxtla Chico',
      'Tuzantán', 'Tzimol', 'Unión Juárez', 'Venustiano Carranza', 'Villa Comaltitlán',
      'Villa Corzo', 'Villaflores', 'Yajalón', 'Zinacantán'
    ];

    this.municipios = fallbackNames.map((nombre, index) => ({
      id_municipio: index + 1,
      clave_estado: 7,
      clave_municipio: index + 1,
      nombre: nombre
    }));

    this.municipiosFiltrados = [...this.municipios];
    this.initializeMunicipioColors();
  }

  // INICIALIZAR COLORES DE MUNICIPIOS
  private initializeMunicipioColors(): void {
    this.municipios.forEach((municipio, index) => {
      this.municipioColorMap.set(municipio.nombre, this.COLORS[index % this.COLORS.length]);
    });
  }

  // INICIALIZACIÓN INMEDIATA DEL MAPA
  private initMapImmediate(): void {
    try {
      this.updateProgress(40, 'Creando mapa...');
      
      // Crear fuente vectorial
      this.vectorSource = new VectorSource({
        wrapX: false
      });
      
      // Crear función de estilo SIN ETIQUETAS PERMANENTES
      const styleFunction: StyleFunction = (feature: FeatureLike): Style => {
        return this.getFeatureStyle(feature as Feature<Geometry>);
      };
      
      // Crear capa vectorial
      this.vectorLayer = new VectorLayer({
        source: this.vectorSource,
        style: styleFunction,
        updateWhileAnimating: false,
        updateWhileInteracting: false,
        renderBuffer: 100,
      });

      this.updateProgress(50, 'Configurando vista...');

      // Configurar vista centrada en Chiapas
      const view = new View({
        center: fromLonLat([-92.6333, 16.75]),
        zoom: 7,
        minZoom: 6,
        maxZoom: 8,
        enableRotation: false,
        constrainResolution: true
      });

      // Crear mapa con interacciones limitadas
      this.map = new OLMap({
        target: this.mapContainer.nativeElement,
        layers: [
          new TileLayer({
            source: new OSM({
              maxZoom: 12,
              wrapX: false,
              transition: 0
            })
          }),
          this.vectorLayer
        ],
        view: view,
        controls: defaultControls({ zoom: false, rotate: false }),
        interactions: defaultInteractions({
          dragPan: false,
          mouseWheelZoom: false
        })
      });

      this.updateProgress(70, 'Configurando eventos...');
      this.setupMapEvents();
      this.initTooltip();
      this.initLabelOverlay();

      this.updateProgress(90, 'Cargando municipios...');
      this.loadGeoJSONFast();

    } catch (error) {
      console.error('Error inicializando mapa:', error);
      this.mapaInicializado = false;
    }
  }

  // Inicializar overlay para etiquetas (solo para hover)
  private initLabelOverlay(): void {
    this.labelElement = document.createElement('div');
    this.labelElement.className = 'municipio-label';
    this.labelElement.style.position = 'absolute';
    this.labelElement.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    this.labelElement.style.padding = '4px 8px';
    this.labelElement.style.borderRadius = '4px';
    this.labelElement.style.fontSize = '12px';
    this.labelElement.style.fontWeight = 'bold';
    this.labelElement.style.pointerEvents = 'none';
    this.labelElement.style.display = 'none';
    this.labelElement.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
    this.labelElement.style.zIndex = '1000';
    
    this.labelOverlay = new Overlay({
      element: this.labelElement,
      positioning: 'center-center',
      stopEvent: false
    });
    
    this.map.addOverlay(this.labelOverlay);
  }

  // Mostrar etiqueta con nombre del municipio (solo en hover)
  private showLabel(municipio: string, coordinate: any): void {
    this.labelElement.innerHTML = municipio;
    this.labelElement.style.display = 'block';
    this.labelOverlay.setPosition(coordinate);
  }

  // Ocultar etiqueta
  private hideLabel(): void {
    this.labelElement.style.display = 'none';
    this.labelOverlay.setPosition(undefined);
  }

  // CARGA RÁPIDA DE GEOJSON
  private loadGeoJSONFast(): void {
    this.createSyntheticGeoJSON();
    
    this.http.get('/chiapas-municipios.geojson', { 
      responseType: 'json',
      observe: 'response',
      reportProgress: false
    }).subscribe({
      next: (response) => {
        if (response.body) {
          this.processGeoJSONUltraFast(response.body);
        }
      },
      error: (error) => {
        console.warn('GeoJSON no disponible, usando datos sintéticos:', error);
        this.finalizarCarga();
      }
    });
  }

  // CREAR GEOJSON SINTÉTICO
  private createSyntheticGeoJSON(): void {
    const features: Feature<Geometry>[] = [];
    
    this.municipios.forEach((municipio, index) => {
      const feature = new Feature({
        geometry: this.createSimplePolygon(index)
      });
      feature.set('NAME_2', municipio.nombre);
      this.featureNameCache.set(feature, municipio.nombre);
      features.push(feature);
    });
    
    this.vectorSource.addFeatures(features);
    this.adjustMapView();
    this.finalizarCarga();
  }

  // CREAR POLÍGONO SIMPLE
  private createSimplePolygon(index: number): Geometry {
    const baseX = -93 + (index % 10) * 0.5;
    const baseY = 16 + Math.floor(index / 10) * 0.3;
    
    const coords = [
      fromLonLat([baseX, baseY]),
      fromLonLat([baseX + 0.3, baseY]),
      fromLonLat([baseX + 0.3, baseY + 0.2]),
      fromLonLat([baseX, baseY + 0.2]),
      fromLonLat([baseX, baseY])
    ];
    
    return new Polygon([coords]);
  }

  // PROCESAMIENTO RÁPIDO DEL GEOJSON REAL
  private processGeoJSONUltraFast(geoJsonData: any): void {
    try {
      const format = new GeoJSON();
      const features = format.readFeatures(geoJsonData, {
        featureProjection: 'EPSG:3857'
      });
      
      this.vectorSource.clear();
      
      const batchSize = 10;
      let processed = 0;
      
      const processBatch = () => {
        const endIndex = Math.min(processed + batchSize, features.length);
        const batch = features.slice(processed, endIndex);
        
        batch.forEach(feature => {
          const nombre = this.extractMunicipalityName(feature);
          this.featureNameCache.set(feature, nombre);
        });
        
        this.vectorSource.addFeatures(batch);
        processed = endIndex;
        
        if (processed < features.length) {
          requestAnimationFrame(processBatch);
        } else {
          this.adjustMapView();
        }
      };
      
      processBatch();
      
    } catch (error) {
      console.error('Error procesando GeoJSON:', error);
    }
  }

  // EXTRAER NOMBRE DE MUNICIPIO
  private extractMunicipalityName(feature: Feature<Geometry>): string {
    return feature.get('NAME_2') || 
           feature.get('NOM_MUN') || 
           feature.get('nombre') || 
           feature.get('NAME') || 
           'Desconocido';
  }

  // ESTILO SIN ETIQUETAS PERMANENTES
  private getFeatureStyle(feature: Feature<Geometry>): Style {
    const nombre = this.featureNameCache.get(feature) || this.extractMunicipalityName(feature);
    
    const isSelected = this.selectFeature === feature;
    const isHovered = this.hoverFeature === feature;
    
    const cacheKey = `${nombre}:${isSelected}:${isHovered}`;
    
    let style = this.styleCache.get(cacheKey);
    if (style) return style;
    
    const color = this.municipioColorMap.get(nombre) || this.generateVibrantColor(nombre);
    
    let fillColor: string;
    let strokeColor: string;
    let strokeWidth: number;
    
    if (isHovered) {
      fillColor = this.hexToRgba(color, 0.9);
      strokeColor = '#FFFFFF';
      strokeWidth = 3;
    } else if (isSelected) {
      fillColor = this.hexToRgba(color, 0.9);
      strokeColor = '#FF5733';
      strokeWidth = 3;
    } else {
      fillColor = this.hexToRgba(color, 0.7);
      strokeColor = '#FFFFFF';
      strokeWidth = 1;
    }
    
    style = new Style({
      stroke: new Stroke({
        color: strokeColor,
        width: strokeWidth
      }),
      fill: new Fill({
        color: fillColor
      })
    });
    
    if (this.styleCache.size > 500) {
      const firstKey = this.styleCache.keys().next().value;
      if (firstKey) {
        this.styleCache.delete(firstKey);
      }
    }
    
    this.styleCache.set(cacheKey, style);
    return style;
  }

  // Generar colores vibrantes
  private generateVibrantColor(nombre: string): string {
    let hash = 0;
    for (let i = 0; i < nombre.length; i++) {
      hash = nombre.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const vibrantColors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', 
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
      '#F8C471', '#82E0AA', '#F1948A', '#AED6F1', '#A9DFBF'
    ];
    
    return vibrantColors[Math.abs(hash) % vibrantColors.length];
  }

  // CONFIGURAR EVENTOS
  private setupMapEvents(): void {
    let hoverTimeout: any;
    
    this.map.on('pointermove', (evt: any) => {
      clearTimeout(hoverTimeout);
      
      hoverTimeout = setTimeout(() => {
        const pixel = this.map.getEventPixel(evt.originalEvent);
        const feature = this.map.forEachFeatureAtPixel(pixel, (f: any) => f);
        
        if (feature !== this.hoverFeature) {
          this.updateHoverFeature(feature as Feature<Geometry> | null);
          
          if (feature) {
            this.map.getTargetElement().style.cursor = 'pointer';
            const nombre = this.featureNameCache.get(feature);
            if (nombre) {
              this.showTooltipFromAPI(nombre, evt.coordinate);
              this.showLabel(nombre, evt.coordinate);
            }
          } else {
            this.map.getTargetElement().style.cursor = '';
            this.hideTooltip();
            this.hideLabel();
          }
        }
      }, 16);
    });

    this.map.on('click', (evt: any) => {
      const feature = this.map.forEachFeatureAtPixel(evt.pixel, (f: any) => f);
      if (feature) {
        const nombre = this.featureNameCache.get(feature);
        if (nombre) {
          this.selectMunicipality(nombre, feature as Feature<Geometry>);
        }
      }
    });
  }

  // ACTUALIZAR FEATURE EN HOVER
  private updateHoverFeature(feature: Feature<Geometry> | null): void {
    if (this.hoverFeature === feature) return;
    
    if (this.hoverFeature) {
      this.clearFeatureStyleCache(this.hoverFeature);
      this.hoverFeature.changed();
    }
    
    this.hoverFeature = feature;
    if (this.hoverFeature) {
      this.clearFeatureStyleCache(this.hoverFeature);
      this.hoverFeature.changed();
    }
  }

  // LIMPIAR CACHE DE ESTILO DE FEATURE
  private clearFeatureStyleCache(feature: Feature<Geometry>): void {
    const nombre = this.featureNameCache.get(feature);
    if (nombre) {
      for (const key of this.styleCache.keys()) {
        if (key.startsWith(`${nombre}:`)) {
          this.styleCache.delete(key);
        }
      }
    }
  }

  // INICIALIZAR TOOLTIP
  private initTooltip(): void {
    this.tooltipOverlay = new Overlay({
      element: this.tooltip.nativeElement,
      positioning: 'bottom-center',
      offset: [0, -10],
      stopEvent: false
    });
    this.map.addOverlay(this.tooltipOverlay);
  }

  // MOSTRAR TOOLTIP CON DATOS DE LA API
  private showTooltipFromAPI(municipio: string, coordinates: any): void {
    // Buscar el municipio en los datos de la API con búsqueda flexible
    const municipioData = this.findMunicipioFlexible(municipio);
    
    if (municipioData) {
      this.tooltip.nativeElement.innerHTML = `
        <div class="tooltip-content">
          <strong>${municipioData.nombre}</strong><br>
          <span class="tooltip-detail">ID: ${municipioData.id_municipio}</span><br>
          <span class="tooltip-detail">Clave: ${municipioData.clave_municipio}</span><br>
          <span class="tooltip-detail">Estado: Chiapas</span>
        </div>
      `;
    } else {
      // Log para debug - ayuda a identificar nombres que no coinciden
      console.warn(`Municipio no encontrado en API: "${municipio}"`);
      this.tooltip.nativeElement.innerHTML = `
        <div class="tooltip-content">
          <strong>${municipio}</strong><br>
          <span class="tooltip-detail">Información no disponible</span>
        </div>
      `;
    }
    
    this.tooltipOverlay.setPosition(coordinates);
    this.tooltip.nativeElement.style.display = 'block';
  }

  // BÚSQUEDA FLEXIBLE DE MUNICIPIOS
  private findMunicipioFlexible(nombre: string): Municipio | undefined {
    const nombreLimpio = this.limpiarNombre(nombre);
    
    return this.municipios.find(m => {
      const nombreAPILimpio = this.limpiarNombre(m.nombre);
      return nombreAPILimpio === nombreLimpio;
    });
  }

  // LIMPIAR NOMBRES PARA COMPARACIÓN
  private limpiarNombre(nombre: string): string {
    return nombre
      .trim() // Quitar espacios al inicio y final
      .toLowerCase() // Convertir a minúsculas
      .normalize('NFD') // Normalizar para quitar acentos
      .replace(/[\u0300-\u036f]/g, '') // Remover diacríticos (acentos)
      .replace(/\s+/g, ' ') // Reemplazar múltiples espacios por uno solo
      .replace(/[^\w\s]/g, ''); // Quitar caracteres especiales excepto espacios
  }

  // OCULTAR TOOLTIP
  private hideTooltip(): void {
    this.tooltip.nativeElement.style.display = 'none';
    this.tooltipOverlay.setPosition(undefined);
  }

  // SELECCIONAR MUNICIPIO (SIN MOSTRAR INFORMACIÓN ADICIONAL)
  public selectMunicipality(municipio: string, feature?: Feature<Geometry>): void {
    this.municipioSeleccionado = municipio;
    this.municipioBuscado = '';
    this.municipiosFiltrados = [...this.municipios];
    
    if (this.selectFeature) {
      this.clearFeatureStyleCache(this.selectFeature);
      this.selectFeature.changed();
    }
    
    this.selectFeature = feature || null;
    if (this.selectFeature) {
      this.clearFeatureStyleCache(this.selectFeature);
      this.selectFeature.changed();
    }
    
    if (feature?.getGeometry()) {
      const extent = feature.getGeometry()!.getExtent();
      this.map.getView().fit(extent, {
        padding: [50, 50, 50, 50],
        duration: 500,
        maxZoom: 8
      });
    }
    
    this.cdr.detectChanges();
  }

  // AJUSTAR VISTA DEL MAPA
  private adjustMapView(): void {
    setTimeout(() => {
      const extent = this.vectorSource.getExtent();
      if (extent?.every(coord => isFinite(coord))) {
        this.map.getView().fit(extent, {
          padding: [20, 20, 20, 20],
          duration: 300,
          maxZoom: 7
        });
      }
    }, 100);
  }

  // FINALIZAR CARGA
  private finalizarCarga(): void {
    this.updateProgress(100, '¡Listo!');
    setTimeout(() => {
      this.mapaInicializado = true;
      this.cdr.detectChanges();
    }, 200);
  }

  // ACTUALIZAR PROGRESO
  private updateProgress(percent: number, message: string): void {
    this.porcentajeCarga = percent;
    this.mensajeCarga = message;
    this.cdr.detectChanges();
  }

  // MÉTODOS PÚBLICOS
  
  filtrarMunicipios(): void {
    const busqueda = this.municipioBuscado.toLowerCase();
    this.municipiosFiltrados = busqueda ? 
      this.municipios.filter(m => m.nombre.toLowerCase().includes(busqueda)) :
      [...this.municipios];
  }

  seleccionarMunicipio(municipio: string): void {
    const feature = this.findFeatureByName(municipio);
    this.selectMunicipality(municipio, feature || undefined);
  }

  resaltarMunicipioEnMapa(municipio: string): void {
    const feature = this.findFeatureByName(municipio);
    if (feature) {
      this.updateHoverFeature(feature);
    }
  }

  quitarResaltadoMapa(): void {
    this.updateHoverFeature(null);
  }

  verDetallesMunicipio(municipio: string): void {
    const municipioData = this.findMunicipioFlexible(municipio);
    if (municipioData) {
      alert(`${municipioData.nombre}\nID: ${municipioData.id_municipio}\nClave Municipio: ${municipioData.clave_municipio}\nClave Estado: ${municipioData.clave_estado}`);
    } else {
      alert(`${municipio}\nInformación no disponible en la API`);
    }
  }

  resetearVistaMapa(): void {
    this.municipioSeleccionado = '';
    this.selectFeature = null;
    this.updateHoverFeature(null);
    this.adjustMapView();
  }

  getColorMunicipio(municipio: string): string {
    return this.municipioColorMap.get(municipio) || this.generateVibrantColor(municipio);
  }

  irALogin(): void {
    this.router.navigate(['/login']);
  }

  // MÉTODOS AUXILIARES

  private findFeatureByName(municipio: string): Feature<Geometry> | null {
    const features = this.vectorSource.getFeatures();
    return features.find(f => this.featureNameCache.get(f) === municipio) || null;
  }

  private hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  private cleanupResources(): void {
    if (this.map) {
      this.map.setTarget(undefined);
    }
    this.styleCache.clear();
    this.featureNameCache.clear();
  }

  // TrackBy function para optimizar *ngFor
  trackByMunicipio(index: number, municipio: Municipio): number {
    return municipio.id_municipio;
  }
}