import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs';
import { Actividad, TipoActividad } from '../../../models';
import { ActividadService } from '../../../shared/services/actividad/actividad.service';
import { ProcesoService } from '../../../shared/services/proceso/proceso.service';
import { AuthService } from '../../../shared/services/auth/auth.service';

@Component({
  selector: 'app-actividad-list',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './actividad-list.component.html',
  styleUrl: './actividad-list.component.css'
})
export class ActividadListComponent {
  actividades = signal<Actividad[]>([]);
  actividadesFiltradas = signal<Actividad[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  procesoId = signal<number | null>(null);
  procesoNombre = signal<string>('');
  
  // Filtros
  searchTerm = signal('');
  filtroTipo = signal<string>('');
  
  // Enum para el template
  TipoActividad = TipoActividad;
  tiposDisponibles = Object.values(TipoActividad);
  
  actividadService = inject(ActividadService);
  procesoService = inject(ProcesoService);
  authService = inject(AuthService);
  route = inject(ActivatedRoute);

  ngOnInit() {
    this.route.params.pipe(
      switchMap(params => {
        const id = params['procesoId'];
        if (id) {
          this.procesoId.set(+id);
          return this.procesoService.getProceso(+id);
        }
        throw new Error('No se proporcionó ID de proceso');
      })
    ).subscribe({
      next: (proceso) => {
        this.procesoNombre.set(proceso.nombre);
        this.loadActividades();
      },
      error: (err) => {
        this.error.set('Error al cargar el proceso: ' + err.message);
      }
    });
  }

  loadActividades() {
    if (!this.procesoId()) return;
    
    this.loading.set(true);
    this.error.set(null);

    this.actividadService.getActividadesByProceso(this.procesoId()!).subscribe({
      next: (actividades) => {
        this.actividades.set(actividades);
        this.actividadesFiltradas.set(actividades);
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set('Error al cargar actividades: ' + error.message);
        this.loading.set(false);
      }
    });
  }

  aplicarFiltros() {
    let resultado = this.actividades();

    // Filtro por búsqueda
    if (this.searchTerm()) {
      const term = this.searchTerm().toLowerCase();
      resultado = resultado.filter(a => 
        a.nombre.toLowerCase().includes(term) ||
        a.descripcion.toLowerCase().includes(term)
      );
    }

    // Filtro por tipo
    if (this.filtroTipo()) {
      resultado = resultado.filter(a => a.tipo === this.filtroTipo());
    }

    this.actividadesFiltradas.set(resultado);
  }

  limpiarFiltros() {
    this.searchTerm.set('');
    this.filtroTipo.set('');
    this.actividadesFiltradas.set(this.actividades());
  }

  deleteActividad(id: number) {
    if (confirm('¿Estás seguro de que quieres eliminar esta actividad?')) {
      this.actividadService.deleteActividad(id).subscribe({
        next: () => {
          alert('Actividad eliminada exitosamente');
          this.loadActividades();
        },
        error: (error) => {
          this.error.set('Error al eliminar actividad: ' + error.message);
        }
      });
    }
  }

  canEdit(): boolean {
    return this.authService.canEdit();
  }

  canDelete(): boolean {
    return this.authService.isAdmin();
  }

  getTipoBadgeClass(tipo: TipoActividad): string {
    switch (tipo) {
      case TipoActividad.TAREA:
        return 'badge-primary';
      case TipoActividad.SUBPROCESO:
        return 'badge-info';
      case TipoActividad.EVENTO_INICIO:
        return 'badge-success';
      case TipoActividad.EVENTO_FIN:
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  }
}

