import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Role } from '../../../models';
import { RoleService } from '../../../shared/services/role/role.service';
import { AuthService } from '../../../shared/services/auth/auth.service';

@Component({
  selector: 'app-role-list',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './role-list.component.html',
  styleUrl: './role-list.component.css'
})
export class RoleListComponent {
  roles = signal<Role[]>([]);
  rolesFiltrados = signal<Role[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  
  searchTerm = signal('');
  
  roleService = inject(RoleService);
  authService = inject(AuthService);

  ngOnInit() {
    this.loadRoles();
  }

  loadRoles() {
    this.loading.set(true);
    this.error.set(null);
    
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.error.set('Usuario no autenticado');
      this.loading.set(false);
      return;
    }

    this.roleService.getRolesByEmpresa(currentUser.empresaId).subscribe({
      next: (roles) => {
        this.roles.set(roles);
        this.rolesFiltrados.set(roles);
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set('Error al cargar roles: ' + error.message);
        this.loading.set(false);
      }
    });
  }

  aplicarFiltros() {
    let resultado = this.roles();

    if (this.searchTerm()) {
      const term = this.searchTerm().toLowerCase();
      resultado = resultado.filter(r => 
        r.nombre.toLowerCase().includes(term) ||
        r.descripcion.toLowerCase().includes(term)
      );
    }

    this.rolesFiltrados.set(resultado);
  }

  limpiarFiltros() {
    this.searchTerm.set('');
    this.rolesFiltrados.set(this.roles());
  }

  deleteRole(id: number) {
    if (confirm('¿Estás seguro de que quieres eliminar este rol? Esta acción no se puede deshacer.')) {
      this.roleService.deleteRole(id).subscribe({
        next: () => {
          alert('Rol eliminado exitosamente');
          this.loadRoles();
        },
        error: (error) => {
          this.error.set('Error al eliminar rol: ' + error.message);
        }
      });
    }
  }
}
