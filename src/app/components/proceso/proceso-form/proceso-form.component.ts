import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, Observable } from 'rxjs';
import { Proceso, ProcesoEstado } from '../../../models';
import { ProcesoService } from '../../../shared/services/proceso/proceso.service';
import { AuthService } from '../../../shared/services/auth/auth.service';

@Component({
  selector: 'app-proceso-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './proceso-form.component.html',
  styleUrl: './proceso-form.component.css'
})
export class ProcesoFormComponent {
  proceso = signal<Proceso>(new Proceso());
  loading = signal(false);
  saving = signal(false);
  error = signal<string | null>(null);
  isEditMode = signal(false);
  
  // Enum para el template
  ProcesoEstado = ProcesoEstado;
  estadosDisponibles = Object.values(ProcesoEstado);
  
  procesoService = inject(ProcesoService);
  authService = inject(AuthService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  ngOnInit() {
    // Asignar empresaId del usuario actual
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      const procesoActual = this.proceso();
      procesoActual.empresaId = currentUser.empresaId;
      this.proceso.set(procesoActual);
    }

    this.route.params.pipe(
      switchMap(params => {
        const id = params['id'];
        if (id) {
          this.isEditMode.set(true);
          this.loading.set(true);
          return this.procesoService.getProceso(id);
        } else {
          return new Observable<Proceso>(subscriber => {
            subscriber.complete();
          });
        }
      })
    ).subscribe({
      next: (proceso) => {
        if (proceso) {
          this.proceso.set(proceso);
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar el proceso: ' + err.message);
        this.loading.set(false);
      }
    });
  }

  saveProceso() {
    const proceso = this.proceso();
    
    if (!proceso.nombre || !proceso.descripcion || !proceso.categoria) {
      this.error.set('Por favor completa todos los campos requeridos');
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    const operation = this.isEditMode()
      ? this.procesoService.updateProceso(proceso.id!, proceso)
      : this.procesoService.createProceso(proceso);
    
    operation.subscribe({
      next: () => {
        this.saving.set(false);
        alert(this.isEditMode() ? 'Proceso actualizado exitosamente' : 'Proceso creado exitosamente');
        this.router.navigate(['/procesos']);
      },
      error: (error) => {
        this.error.set('Error al guardar proceso: ' + error.message);
        this.saving.set(false);
      }
    });
  }

  cancel() {
    this.router.navigate(['/procesos']);
  }
}
