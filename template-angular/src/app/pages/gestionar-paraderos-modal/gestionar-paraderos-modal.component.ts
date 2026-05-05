// ─────────────────────────────────────────────────────────────────────────────
// src/app/pages/rutas/gestionar-paraderos-modal/
//   gestionar-paraderos-modal.component.ts
//
// CAMBIO: ordenamiento por campos numéricos en lugar de drag & drop
// ─────────────────────────────────────────────────────────────────────────────

import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  OnDestroy,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';

import { Paradero } from 'src/app/models/Paradero/paradero.model';
import { ParaderoService } from 'src/app/services/Paradero/paradero.service';
import {
  NodoService,
  GuardarNodosRutaPayload,
  NodoPayloadItem,
} from 'src/app/services/Nodo/nodo.service';

const MIN_PARADEROS = 3;
const VELOCIDAD_BUS_KMH = 25;
const RADIO_TIERRA_KM = 6371;

/** Paradero extendido con campo interno de orden editable por el usuario */
export interface ParaderoConOrden extends Paradero {
  _orden: number;
}

@Component({
  selector: 'app-gestionar-paraderos-modal',
  templateUrl: './gestionar-paraderos-modal.component.html',
  styleUrls: ['./gestionar-paraderos-modal.component.scss'],
})
export class GestionarParaderosModalComponent implements OnChanges, OnDestroy {

  @Input() show = false;
  @Input() rutaId!: number;
  @Input() rutaNombre = '';
  @Output() closed = new EventEmitter<boolean>(); // true = hubo cambios guardados

  private _todos: Paradero[] = [];
  disponibles: Paradero[] = [];

  /** Lista de paraderos seleccionados, cada uno con su campo _orden editable */
  seleccionados: ParaderoConOrden[] = [];

  loadingParaderos = false;
  saving = false;
  errorMsg = '';

  searchControl = new FormControl<string>('');
  readonly MIN_PARADEROS = MIN_PARADEROS;

  private destroy$ = new Subject<void>();

  constructor(
    private paraderoService: ParaderoService,
    private nodoService: NodoService
  ) {
    this.searchControl.valueChanges
      .pipe(debounceTime(250), takeUntil(this.destroy$))
      .subscribe((term) => this.filtrar(term ?? ''));
  }

  // ─── Ciclo de vida ────────────────────────────────────────────────────────

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['show']?.currentValue === true) {
      this.resetEstado();
      this.cargarDatos();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─── Estado ───────────────────────────────────────────────────────────────

  private resetEstado(): void {
    this._todos = [];
    this.disponibles = [];
    this.seleccionados = [];
    this.errorMsg = '';
    this.searchControl.setValue('', { emitEvent: false });
  }

  // ─── Carga de datos ───────────────────────────────────────────────────────

  private cargarDatos(): void {
    this.loadingParaderos = true;
    let todosTemp: Paradero[] = [];
    let paraderosDone = false;
    let nodosDone = false;

    this.paraderoService
      .getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          todosTemp = data.map((p: any) => ({
            ...p,
            nombre: p.nombre ?? p.name ?? p.Nombre ?? '',
            clasificacion: p.clasificacion ?? p.clasificación ?? p.tipo ?? '',
          }));
          paraderosDone = true;
          if (nodosDone) this.combinarDatos(todosTemp);
        },
        error: () => {
          this.errorMsg = 'No se pudieron cargar los paraderos.';
          this.loadingParaderos = false;
        },
      });

    this.nodoService
      .getByRuta(this.rutaId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (nodos) => {
          // Ordena por el campo orden del backend y asigna _orden editable
          const ordenados = [...nodos].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
          this.seleccionados = ordenados
            .map((n, i): ParaderoConOrden | null => {
              if (!n.paradero) return null;
              return { ...n.paradero, _orden: n.orden ?? i + 1 };
            })
            .filter((p): p is ParaderoConOrden => !!p);
          nodosDone = true;
          if (paraderosDone) this.combinarDatos(todosTemp);
        },
        error: () => {
          nodosDone = true;
          if (paraderosDone) this.combinarDatos(todosTemp);
        },
      });
  }

  private combinarDatos(todos: Paradero[]): void {
    this._todos = todos;
    this.filtrar('');
    this.loadingParaderos = false;
  }

  // ─── Filtrado ─────────────────────────────────────────────────────────────

  private filtrar(term: string): void {
    const t = term.toLowerCase().trim();
    this.disponibles = this._todos.filter(
      (p) =>
        !this.estaSeleccionado(p) &&
        p.nombre?.toLowerCase().includes(t)
    );
  }

  // ─── Selección ────────────────────────────────────────────────────────────

  estaSeleccionado(p: Paradero): boolean {
    return this.seleccionados.some((s) => s.id === p.id);
  }

  /** Al agregar, asigna automáticamente el siguiente número de orden disponible */
  agregar(p: Paradero): void {
    if (this.estaSeleccionado(p)) return;
    const siguienteOrden = this.proximoOrdenLibre();
    const item: ParaderoConOrden = { ...p, _orden: siguienteOrden };
    this.seleccionados = [...this.seleccionados, item];
    this.filtrar(this.searchControl.value ?? '');
  }

  remover(index: number): void {
    this.seleccionados = this.seleccionados.filter((_, i) => i !== index);
    this.filtrar(this.searchControl.value ?? '');
  }

  limpiar(): void {
    this.seleccionados = [];
    this.filtrar(this.searchControl.value ?? '');
  }

  /** Número de orden siguiente: el primer entero positivo que no esté en uso */
  private proximoOrdenLibre(): number {
    const usados = new Set(this.seleccionados.map((s) => s._orden));
    let n = 1;
    while (usados.has(n)) n++;
    return n;
  }

  // ─── Orden numérico ───────────────────────────────────────────────────────

  /** Llamado por (ngModelChange) en el input numérico; fuerza detección de cambios */
  onOrdenChange(): void {
    // Angular detecta el cambio en el array automáticamente gracias al binding
  }

  /** Reordena el array por los números asignados y reasigna valores consecutivos */
  ordenarPorNumero(): void {
    this.seleccionados = [...this.seleccionados].sort(
      (a, b) => (a._orden ?? 0) - (b._orden ?? 0)
    );
    // Reasigna valores consecutivos eliminando huecos
    this.seleccionados.forEach((p, i) => (p._orden = i + 1));
  }

  // ─── Validación de duplicados ─────────────────────────────────────────────

  tieneOrdenDuplicado(orden: number): boolean {
    return this.seleccionados.filter((s) => s._orden === orden).length > 1;
  }

  get hayDuplicados(): boolean {
    const ordenes = this.seleccionados.map((s) => s._orden);
    return new Set(ordenes).size !== ordenes.length;
  }

  // ─── Etiquetas inicio / fin ───────────────────────────────────────────────

  esPrimero(orden: number): boolean {
    if (this.seleccionados.length === 0) return false;
    const min = Math.min(...this.seleccionados.map((s) => s._orden));
    return orden === min;
  }

  esUltimo(orden: number): boolean {
    if (this.seleccionados.length === 0) return false;
    const max = Math.max(...this.seleccionados.map((s) => s._orden));
    return orden === max;
  }

  // ─── Validación general ───────────────────────────────────────────────────

  get esValido(): boolean {
    return this.seleccionados.length >= MIN_PARADEROS && !this.hayDuplicados;
  }

  get mensajeValidacion(): string {
    const f = MIN_PARADEROS - this.seleccionados.length;
    if (f <= 0) return '';
    return `Faltan ${f} paradero${f === 1 ? '' : 's'} para el mínimo (${MIN_PARADEROS})`;
  }

  // ─── Haversine ────────────────────────────────────────────────────────────

  private haversineKm(p1: Paradero, p2: Paradero): number {
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad((p2.latitud ?? 0) - (p1.latitud ?? 0));
    const dLon = toRad((p2.longitud ?? 0) - (p1.longitud ?? 0));
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(p1.latitud ?? 0)) *
      Math.cos(toRad(p2.latitud ?? 0)) *
      Math.sin(dLon / 2) ** 2;
    return RADIO_TIERRA_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private tiempoMin(distKm: number): number {
    return Math.round((distKm / VELOCIDAD_BUS_KMH) * 60);
  }

  // ─── Payload ──────────────────────────────────────────────────────────────

  private construirPayload(): GuardarNodosRutaPayload {
    // Ordena por _orden antes de construir el payload
    const ordenados = [...this.seleccionados].sort((a, b) => a._orden - b._orden);

    const nodos: NodoPayloadItem[] = ordenados.map((p, i) => {
      const ant = i > 0 ? ordenados[i - 1] : null;
      const dist = ant ? parseFloat(this.haversineKm(ant, p).toFixed(3)) : 0;
      return {
        paraderoId: p.id!,
        orden: p._orden,             // usa el número que eligió el usuario
        distanciaDesdeAnterior: dist,
        tiempoEstimado: this.tiempoMin(dist),
      };
    });

    return { rutaId: this.rutaId, nodos };
  }

  // ─── Acciones ─────────────────────────────────────────────────────────────

  guardar(): void {
    if (!this.esValido || this.saving) return;

    this.saving = true;
    this.errorMsg = '';

    this.nodoService
      .guardarNodosRuta(this.construirPayload())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.saving = false;
          Swal.fire('Guardado', 'Paraderos de la ruta actualizados correctamente.', 'success');
          this.closed.emit(true);
        },
        error: () => {
          this.saving = false;
          this.errorMsg = 'No se pudo guardar la configuración. Intente nuevamente.';
        },
      });
  }

  cerrar(): void {
    if (this.saving) return;
    this.closed.emit(false);
  }

  trackById(_: number, p: ParaderoConOrden): number {
    return p.id!;
  }
}
