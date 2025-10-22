import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { Proceso, ProcesoEstado } from '../../../models';
import { ProcesoService } from '../../../shared/services/proceso/proceso.service';
import { AuthService } from '../../../shared/services/auth/auth.service';

@Component({
  selector: 'app-proceso-detail',
  imports: [CommonModule, RouterLink],
  templateUrl: './proceso-detail.component.html',
  styleUrl: './proceso-detail.component.css'
})
export class ProcesoDetailComponent {
  proceso = signal<Proceso | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  
  ProcesoEstado = ProcesoEstado;
  
  procesoService = inject(ProcesoService);
  authService = inject(AuthService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  ngOnInit() {
    this.route.params.pipe(
      switchMap(params => {
        const id = params['id'];
        if (!id) {
          throw new Error('No se proporcionó ID de proceso');
        }
        this.loading.set(true);
        return this.procesoService.getProceso(+id);
      })
    ).subscribe({
      next: (proceso) => {
        this.proceso.set(proceso);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar el proceso: ' + err.message);
        this.loading.set(false);
      }
    });
  }

  deleteProceso() {
    if (!this.proceso()?.id) return;
    
    if (confirm('¿Estás seguro de que quieres eliminar este proceso? Esta acción no se puede deshacer.')) {
      this.procesoService.deleteProceso(this.proceso()!.id!).subscribe({
        next: () => {
          alert('Proceso eliminado exitosamente');
          this.router.navigate(['/procesos']);
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
        return 'badge bg-success';
      case ProcesoEstado.BORRADOR:
        return 'badge bg-warning';
      case ProcesoEstado.INACTIVO:
        return 'badge bg-danger';
      default:
        return 'badge bg-info';
    }
  }
}

