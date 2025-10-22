import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Empresa } from '../../../models';
import { EmpresaService } from '../../../shared/services/empresa/empresa.service';
import { AuthService } from '../../../shared/services/auth/auth.service';

@Component({
  selector: 'app-empresa-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './empresa-list.component.html',
  styleUrl: './empresa-list.component.css'
})
export class EmpresaListComponent {
  empresa = signal<Empresa | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  
  empresaService = inject(EmpresaService);
  authService = inject(AuthService);

  ngOnInit() {
    this.loadEmpresa();
  }

  loadEmpresa() {
    this.loading.set(true);
    this.error.set(null);
    
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.error.set('Usuario no autenticado');
      this.loading.set(false);
      return;
    }

    this.empresaService.getEmpresa(currentUser.empresaId).subscribe({
      next: (empresa) => {
        this.empresa.set(empresa);
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set('Error al cargar empresa: ' + error.message);
        this.loading.set(false);
      }
    });
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }
}

