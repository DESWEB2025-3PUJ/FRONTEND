import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { Proceso, Actividad } from '../../../models';
import { ProcesoService } from '../../../shared/services/proceso/proceso.service';
import { ActividadService } from '../../../shared/services/actividad/actividad.service';

@Component({
  selector: 'app-proceso-diagram',
  imports: [CommonModule, RouterLink],
  templateUrl: './proceso-diagram.component.html',
  styleUrl: './proceso-diagram.component.css'
})
export class ProcesoDiagramComponent {
  proceso = signal<Proceso | null>(null);
  actividades = signal<Actividad[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  
  procesoService = inject(ProcesoService);
  actividadService = inject(ActividadService);
  route = inject(ActivatedRoute);

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
        this.loadActividades(proceso.id!);
      },
      error: (err) => {
        this.error.set('Error al cargar el proceso: ' + err.message);
        this.loading.set(false);
      }
    });
  }

  loadActividades(procesoId: number) {
    this.actividadService.getActividadesByProceso(procesoId).subscribe({
      next: (actividades) => {
        this.actividades.set(actividades);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar actividades: ' + err.message);
        this.loading.set(false);
      }
    });
  }
}

