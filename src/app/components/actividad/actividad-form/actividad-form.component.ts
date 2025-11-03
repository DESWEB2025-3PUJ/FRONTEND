import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, Observable } from 'rxjs';
import { Actividad, TipoActividad } from '../../../models';
import { ActividadService } from '../../../shared/services/actividad/actividad.service';
import { ProcesoService } from '../../../shared/services/proceso/proceso.service';
import { RoleService } from '../../../shared/services/role/role.service';
import { AuthService } from '../../../shared/services/auth/auth.service';

@Component({
  selector: 'app-actividad-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './actividad-form.component.html',
  styleUrl: './actividad-form.component.css'
})
export class ActividadFormComponent {
  actividad = signal<Actividad>(new Actividad());
  loading = signal(false);
  saving = signal(false);
  error = signal<string | null>(null);
  isEditMode = signal(false);
  procesoId = signal<number | null>(null);
  procesoNombre = signal<string>('');
  rolesDisponibles = signal<any[]>([]);
  
  // Enum para el template
  TipoActividad = TipoActividad;
  tiposDisponibles = Object.values(TipoActividad);
  
  actividadService = inject(ActividadService);
  procesoService = inject(ProcesoService);
  roleService = inject(RoleService);
  authService = inject(AuthService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  ngOnInit() {
    // Cargar roles disponibles
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.roleService.getRolesByEmpresa(currentUser.empresaId).subscribe({
        next: (roles) => {
          this.rolesDisponibles.set(roles);
        },
        error: (err) => {
          console.error('Error al cargar roles:', err);
        }
      });
    }

    this.route.params.pipe(
      switchMap(params => {
        const procesoId = params['procesoId'];
        const actividadId = params['id'];
        
        if (!procesoId) {
          throw new Error('No se proporcionó ID de proceso');
        }
        
        this.procesoId.set(+procesoId);
        
        // Asignar procesoId a la actividad
        const actividadActual = this.actividad();
        actividadActual.procesoId = +procesoId;
        this.actividad.set(actividadActual);
        
        // Cargar información del proceso
        return this.procesoService.getProceso(+procesoId).pipe(
          switchMap(proceso => {
            this.procesoNombre.set(proceso.nombre);
            
            // Si hay ID de actividad, cargarla
            if (actividadId) {
              this.isEditMode.set(true);
              this.loading.set(true);
              return this.actividadService.getActividad(+actividadId);
            } else {
              return new Observable<Actividad>(subscriber => {
                subscriber.complete();
              });
            }
          })
        );
      })
    ).subscribe({
      next: (actividad) => {
        if (actividad) {
          this.actividad.set(actividad);
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar datos: ' + err.message);
        this.loading.set(false);
      }
    });
  }

  saveActividad() {
    const actividad = this.actividad();
    
    if (!actividad.nombre || !actividad.descripcion || !actividad.tipo) {
      this.error.set('Por favor completa todos los campos requeridos');
      return;
    }

    if (!actividad.duracionEstimada || actividad.duracionEstimada <= 0) {
      this.error.set('La duración estimada debe ser mayor a 0');
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    const operation = this.isEditMode()
      ? this.actividadService.updateActividad(actividad.id!, actividad)
      : this.actividadService.createActividad(actividad);

    operation.subscribe({
      next: () => {
        alert(this.isEditMode() ? 'Actividad actualizada exitosamente' : 'Actividad creada exitosamente');
        this.router.navigate(['/procesos', this.procesoId(), 'actividades']);
      },
      error: (error) => {
        this.error.set('Error al guardar actividad: ' + error.message);
        this.saving.set(false);
      }
    });
  }

  cancel() {
    this.router.navigate(['/procesos', this.procesoId(), 'actividades']);
  }
}

