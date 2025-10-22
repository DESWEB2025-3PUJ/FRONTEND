import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../shared/services/auth/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  correo = signal('');
  password = signal('');
  loading = signal(false);
  error = signal<string | null>(null);
  
  authService = inject(AuthService);
  router = inject(Router);

  login() {
    if (!this.correo() || !this.password()) {
      this.error.set('Por favor completa todos los campos');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.authService.login(this.correo(), this.password()).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/procesos']);
      },
      error: (err) => {
        this.error.set('Error al iniciar sesión: ' + err.message);
        this.loading.set(false);
      }
    });
  }
}
