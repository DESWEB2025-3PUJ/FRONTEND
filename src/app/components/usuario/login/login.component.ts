import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService, LoginDto } from '../../../shared/services/auth/auth.service';
import { UsuarioRol } from '../../../models';

/**
 * Componente de Login (HU-03)
 * Características:
 * ✅ Usa signals de Angular 18+ para estado reactivo
 * ✅ Hace logout automático al entrar (ngOnInit)
 * ✅ Redirige según el rol después del login:
 *    - ADMINISTRADOR → /usuarios/empresa/{empresaId}
 *    - EDITOR → /home
 *    - SOLO_LECTURA → /home
 */
@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  // Signals para estado reactivo
  loginDto = signal<LoginDto>({
    correo: '',
    password: ''
  });
  
  loading = signal(false);
  error = signal<string | null>(null);
  
  // Inyección de dependencias con inject()
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  ngOnInit(): void {
    // No hacer logout automático - causa problemas con la navegación
  }

  /**
   * Maneja el envío del formulario de login
   */
  onLogin(): void {
    const credentials = this.loginDto();

    // Validaciones básicas
    if (!credentials.correo || !credentials.password) {
      this.error.set('Por favor completa todos los campos');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    // Realizar login
    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.loading.set(false);
        
        // Esperar un tick para asegurar que sessionStorage esté actualizado
        // antes de la redirección (evita race conditions con guards)
        setTimeout(() => {
          this.redirectByRole(response.usuario.rol, response.usuario.empresaId);
        }, 100);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
      }
    });
  }

  /**
   * Redirige al usuario según su rol después del login exitoso
   */
  private redirectByRole(rol: string, empresaId: number): void {
    // Verificar si hay una URL de retorno
    const returnUrl = this.route.snapshot.queryParams['returnUrl'];
    
    if (returnUrl) {
      this.router.navigateByUrl(returnUrl);
      return;
    }

    // Redirigir según el rol
    switch (rol) {
      case UsuarioRol.ADMINISTRADOR:
        // ADMINISTRADOR → Home (temporalmente, hasta crear UsuariosListComponent)
        // TODO: Cambiar a /usuarios/empresa/${empresaId} cuando el componente exista
        this.router.navigate(['/home']);
        break;
      
      case UsuarioRol.EDITOR:
      case UsuarioRol.SOLO_LECTURA:
      default:
        this.router.navigate(['/home']);
        break;
    }
  }

  /**
   * Actualiza el campo de correo
   */
  updateCorreo(correo: string): void {
    this.loginDto.update(dto => ({ ...dto, correo }));
  }

  /**
   * Actualiza el campo de contraseña
   */
  updatePassword(password: string): void {
    this.loginDto.update(dto => ({ ...dto, password }));
  }
}
