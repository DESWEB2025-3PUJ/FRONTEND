import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { Empresa, Usuario, UsuarioRol } from '../../../models';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  // Datos de empresa
  empresaNombre = signal('');
  empresaNit = signal('');
  empresaCorreo = signal('');
  
  // Datos de usuario
  usuarioNombre = signal('');
  usuarioCorreo = signal('');
  usuarioPassword = signal('');
  usuarioPasswordConfirm = signal('');
  
  loading = signal(false);
  error = signal<string | null>(null);
  
  authService = inject(AuthService);
  router = inject(Router);

  register() {
    // Validaciones
    if (!this.empresaNombre() || !this.empresaNit() || !this.empresaCorreo() ||
        !this.usuarioNombre() || !this.usuarioCorreo() || !this.usuarioPassword()) {
      this.error.set('Por favor completa todos los campos requeridos');
      return;
    }

    if (this.usuarioPassword() !== this.usuarioPasswordConfirm()) {
      this.error.set('Las contraseñas no coinciden');
      return;
    }

    if (this.usuarioPassword().length < 6) {
      this.error.set('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const empresa: Partial<Empresa> = {
      nombre: this.empresaNombre(),
      nit: this.empresaNit(),
      correo: this.empresaCorreo()
    };

    const usuario: Partial<Usuario> = {
      nombre: this.usuarioNombre(),
      correo: this.usuarioCorreo(),
      password: this.usuarioPassword(),
      rol: UsuarioRol.ADMINISTRADOR
    };

    this.authService.register(empresa, usuario).subscribe({
      next: () => {
        this.loading.set(false);
        alert('Registro exitoso. Bienvenido a WikiGroup!');
        this.router.navigate(['/procesos']);
      },
      error: (err) => {
        this.error.set('Error al registrarse: ' + err.message);
        this.loading.set(false);
      }
    });
  }
}
