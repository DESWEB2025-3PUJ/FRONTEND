import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, SignupRequest } from '../../../shared/services/auth/auth.service';
import { UsuarioRol } from '../../../models';

/**
 * Componente de Registro (HU-01)
 * Registro de empresa con usuario administrador
 * 
 * Características:
 * ✅ Validaciones:
 *    - Todos los campos completos
 *    - NIT único
 *    - Email válido y único
 *    - Contraseña mínimo 6 caracteres
 * ✅ Manejo de errores específicos:
 *    - Error 400 "El correo ya está registrado" → Mensaje específico
 *    - Error 400 "El NIT ya está registrado" → Mensaje específico
 *    - Otros → Mensaje genérico
 */
@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  // Signal con la estructura completa de registro
  signupRequest = signal<SignupRequest>({
    empresa: {
      nombre: '',
      nit: '',
      correoContacto: '',
      descripcion: ''
    },
    usuario: {
      nombre: '',
      email: '',
      password: ''
    }
  });

  // Contraseña de confirmación (no se envía al backend)
  passwordConfirm = signal('');
  
  loading = signal(false);
  error = signal<string | null>(null);
  
  // Inyección de dependencias con inject()
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  /**
   * Maneja el envío del formulario de registro
   */
  onRegister(): void {
    const request = this.signupRequest();

    // Validación: Todos los campos completos
    if (!request.empresa.nombre || !request.empresa.nit || !request.empresa.correoContacto ||
        !request.usuario.nombre || !request.usuario.email || !request.usuario.password) {
      this.error.set('Por favor completa todos los campos requeridos');
      return;
    }

    // Validación: Contraseñas coinciden
    if (request.usuario.password !== this.passwordConfirm()) {
      this.error.set('Las contraseñas no coinciden');
      return;
    }

    // Validación: Contraseña mínimo 6 caracteres
    if (request.usuario.password.length < 6) {
      this.error.set('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    // Validación: Email válido
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(request.usuario.email)) {
      this.error.set('Por favor ingresa un email válido');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    // Realizar registro (signup)
    this.authService.signup(request).subscribe({
      next: (response) => {
        this.loading.set(false);
        
        // Redirigir al administrador a la lista de usuarios de su empresa
        this.router.navigate(['/usuarios/empresa', response.usuario.empresaId]);
      },
      error: (err) => {
        this.loading.set(false);
        
        // Manejo de errores específicos
        this.handleRegistrationError(err);
      }
    });
  }

  /**
   * Maneja los errores de registro con mensajes específicos
   */
  private handleRegistrationError(err: any): void {
    const errorMessage = err.message || '';
    const errorStatus = err.status;

    // Errores 400 - Validaciones del backend
    if (errorStatus === 400) {
      if (errorMessage.toLowerCase().includes('correo') && errorMessage.toLowerCase().includes('registrado')) {
        this.error.set('El correo ya está registrado. Por favor usa otro correo.');
        return;
      }
      
      if (errorMessage.toLowerCase().includes('nit') && errorMessage.toLowerCase().includes('registrado')) {
        this.error.set('El NIT ya está registrado. Por favor verifica el NIT de tu empresa.');
        return;
      }
    }

    // Error genérico
    this.error.set(errorMessage || 'Error al registrar la empresa. Por favor intenta nuevamente.');
  }

  // ============================================
  // Métodos auxiliares para actualizar el signal
  // ============================================

  updateEmpresaNombre(nombre: string): void {
    this.signupRequest.update(req => ({
      ...req,
      empresa: { ...req.empresa, nombre }
    }));
  }

  updateEmpresaNit(nit: string): void {
    this.signupRequest.update(req => ({
      ...req,
      empresa: { ...req.empresa, nit }
    }));
  }

  updateEmpresaCorreo(correoContacto: string): void {
    this.signupRequest.update(req => ({
      ...req,
      empresa: { ...req.empresa, correoContacto }
    }));
  }

  updateEmpresaDescripcion(descripcion: string): void {
    this.signupRequest.update(req => ({
      ...req,
      empresa: { ...req.empresa, descripcion }
    }));
  }

  updateUsuarioNombre(nombre: string): void {
    this.signupRequest.update(req => ({
      ...req,
      usuario: { ...req.usuario, nombre }
    }));
  }

  updateUsuarioEmail(email: string): void {
    this.signupRequest.update(req => ({
      ...req,
      usuario: { ...req.usuario, email }
    }));
  }

  updateUsuarioPassword(password: string): void {
    this.signupRequest.update(req => ({
      ...req,
      usuario: { ...req.usuario, password }
    }));
  }
}
