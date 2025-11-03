import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, Observable } from 'rxjs';
import { Empresa } from '../../../models';
import { EmpresaService } from '../../../shared/services/empresa/empresa.service';
import { AuthService } from '../../../shared/services/auth/auth.service';

@Component({
  selector: 'app-empresa-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './empresa-form.component.html',
  styleUrl: './empresa-form.component.css'
})
export class EmpresaFormComponent {
  empresa = signal<Empresa>(new Empresa());
  loading = signal(false);
  saving = signal(false);
  error = signal<string | null>(null);
  isEditMode = signal(true); // Siempre es edición
  
  empresaService = inject(EmpresaService);
  authService = inject(AuthService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  ngOnInit() {
    this.route.params.pipe(
      switchMap(params => {
        const id = params['id'];
        if (id) {
          this.loading.set(true);
          return this.empresaService.getEmpresa(+id);
        } else {
          // Si no hay ID, cargar la empresa del usuario actual
          const currentUser = this.authService.getCurrentUser();
          if (currentUser) {
            this.loading.set(true);
            return this.empresaService.getEmpresa(currentUser.empresaId);
          }
          throw new Error('No se pudo identificar la empresa');
        }
      })
    ).subscribe({
      next: (empresa) => {
        this.empresa.set(empresa);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar empresa: ' + err.message);
        this.loading.set(false);
      }
    });
  }

  saveEmpresa() {
    const empresa = this.empresa();
    
    if (!empresa.nombre || !empresa.nit || !empresa.correo) {
      this.error.set('Por favor completa todos los campos requeridos');
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    this.empresaService.updateEmpresa(empresa.id!, empresa).subscribe({
      next: () => {
        alert('Empresa actualizada exitosamente');
        this.router.navigate(['/empresas']);
      },
      error: (error) => {
        this.error.set('Error al actualizar empresa: ' + error.message);
        this.saving.set(false);
      }
    });
  }

  cancel() {
    this.router.navigate(['/empresas']);
  }
}

