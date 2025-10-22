import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, Observable } from 'rxjs';
import { Role } from '../../../models';
import { RoleService } from '../../../shared/services/role/role.service';
import { AuthService } from '../../../shared/services/auth/auth.service';

@Component({
  selector: 'app-role-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './role-form.component.html',
  styleUrl: './role-form.component.css'
})
export class RoleFormComponent {
  role = signal<Role>(new Role());
  loading = signal(false);
  saving = signal(false);
  error = signal<string | null>(null);
  isEditMode = signal(false);
  
  roleService = inject(RoleService);
  authService = inject(AuthService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  ngOnInit() {
    // Asignar empresaId del usuario actual
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      const roleActual = this.role();
      roleActual.empresaId = currentUser.empresaId;
      this.role.set(roleActual);
    }

    this.route.params.pipe(
      switchMap(params => {
        const id = params['id'];
        if (id) {
          this.isEditMode.set(true);
          this.loading.set(true);
          return this.roleService.getRole(id);
        } else {
          return new Observable<Role>(subscriber => {
            subscriber.complete();
          });
        }
      })
    ).subscribe({
      next: (role) => {
        if (role) {
          this.role.set(role);
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar el rol: ' + err.message);
        this.loading.set(false);
      }
    });
  }

  saveRole() {
    const role = this.role();
    
    if (!role.nombre || !role.descripcion) {
      this.error.set('Por favor completa todos los campos requeridos');
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    const operation = this.isEditMode()
      ? this.roleService.updateRole(role.id!, role)
      : this.roleService.createRole(role);
    
    operation.subscribe({
      next: () => {
        this.saving.set(false);
        alert(this.isEditMode() ? 'Rol actualizado exitosamente' : 'Rol creado exitosamente');
        this.router.navigate(['/roles']);
      },
      error: (error) => {
        this.error.set('Error al guardar rol: ' + error.message);
        this.saving.set(false);
      }
    });
  }

  cancel() {
    this.router.navigate(['/roles']);
  }
}
