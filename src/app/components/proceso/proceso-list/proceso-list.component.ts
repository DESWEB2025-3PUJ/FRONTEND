import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Proceso, ProcesoEstado } from '../../../models';
import { ProcesoService } from '../../../shared/services/proceso/proceso.service';
import { AuthService } from '../../../shared/services/auth/auth.service';

@Component({
  selector: 'app-proceso-list',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './proceso-list.component.html',
  styleUrl: './proceso-list.component.css'
})
export class ProcesoListComponent {
  procesos = signal<Proceso[]>([]);
  procesosFiltrados = signal<Proceso[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  
  // Filtros
  searchTerm = signal('');
  filtroEstado = signal<string>('');
  filtroCategoria = signal<string>('');
  
  // Enum para el template
  ProcesoEstado = ProcesoEstado;
  
  procesoService = inject(ProcesoService);
  authService = inject(AuthService);

  ngOnInit() {
    this.loadProcesos();
  }

  loadProcesos() {
    this.loading.set(true);
    this.error.set(null);
    
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.error.set('Usuario no autenticado');
      this.loading.set(false);
      return;
    }

    this.procesoService.getProcesosByEmpresa(currentUser.empresaId).subscribe({
      next: (procesos) => {
        this.procesos.set(procesos);
        this.procesosFiltrados.set(procesos);
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set('Error al cargar procesos: ' + error.message);
        this.loading.set(false);
      }
    });
  }

  aplicarFiltros() {
    let resultado = this.procesos();

    // Filtro por búsqueda
    if (this.searchTerm()) {
      const term = this.searchTerm().toLowerCase();
      resultado = resultado.filter(p => 
        p.nombre.toLowerCase().includes(term) ||
        p.descripcion.toLowerCase().includes(term)
      );
    }

    // Filtro por estado
    if (this.filtroEstado()) {
      resultado = resultado.filter(p => p.estado === this.filtroEstado());
    }

    // Filtro por categoría
    if (this.filtroCategoria()) {
      resultado = resultado.filter(p => 
        p.categoria.toLowerCase().includes(this.filtroCategoria().toLowerCase())
      );
    }

    this.procesosFiltrados.set(resultado);
  }

  limpiarFiltros() {
    this.searchTerm.set('');
    this.filtroEstado.set('');
    this.filtroCategoria.set('');
    this.procesosFiltrados.set(this.procesos());
  }

  deleteProceso(id: number) {
    if (confirm('¿Estás seguro de que quieres eliminar este proceso? Esta acción no se puede deshacer.')) {
      this.procesoService.deleteProceso(id).subscribe({
        next: () => {
          alert('Proceso eliminado exitosamente');
          this.loadProcesos();
        },
        error: (error) => {
          this.error.set('Error al eliminar proceso: ' + error.message);
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

  getEstadoBadgeClass(estado: ProcesoEstado): string {
    switch (estado) {
      case ProcesoEstado.PUBLICADO:
        return 'badge-success';
      case ProcesoEstado.BORRADOR:
        return 'badge-warning';
      case ProcesoEstado.INACTIVO:
        return 'badge-danger';
      default:
        return 'badge-info';
    }
  }
}
