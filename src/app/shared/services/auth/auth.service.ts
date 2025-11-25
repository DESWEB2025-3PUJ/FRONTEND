import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { Usuario, UsuarioRol } from '../../../models';
import { environment } from '../../../../environments/environment';

// ============================================
// Interfaces para autenticación JWT
// ============================================

/**
 * Estructura para el registro de empresa y usuario administrador (HU-01)
 */
export interface SignupRequest {
  empresa: {
    nombre: string;
    nit: string;
    correoContacto: string;
    descripcion?: string;
  };
  usuario: {
    nombre: string;
    email: string;
    password: string;
  };
}

/**
 * Estructura para el login (HU-03)
 */
export interface LoginDto {
  correo: string;
  password: string;
}

/**
 * Respuesta del backend para registro y login
 */
export interface JwtAuthenticationResponse {
  token: string;
  usuario: {
    id: number;
    nombre: string;
    email: string;
    rol: string;
    empresaId: number;
    password?: null;
  };
}

// ============================================
// Claves para sessionStorage
// ============================================
const STORAGE_KEYS = {
  JWT_TOKEN: 'JWT_TOKEN',
  EMAIL: 'EMAIL',
  ROLE: 'ROLE',
  NOMBRE: 'NOMBRE',
  ID_USUARIO: 'ID_USUARIO',
  EMPRESA_ID: 'EMPRESA_ID'
} as const;

/**
 * Servicio de autenticación JWT
 * Implementa autenticación con Spring Boot Backend
 * Usa sessionStorage para almacenamiento de datos
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  // FLAGS DE BYPASS PARA TESTS (environment.test.ts)
  // En environment normal estos van en false
  private readonly bypassAuth = environment['bypassAuth'] === true;

  constructor() {
    // En modo bypass (tests), simulamos un usuario logueado al arrancar
    if (this.bypassAuth && isPlatformBrowser(this.platformId)) {
      const fakeResponse: JwtAuthenticationResponse = {
        token: 'fake-token',
        usuario: {
          id: 1,
          nombre: 'Usuario Selenium',
          email: 'selenium@test.com',
          rol: UsuarioRol.ADMINISTRADOR,
          empresaId: 1,
          password: null
        }
      };
      this.saveSession(fakeResponse);
    }
  }

  // ============================================
  // Métodos de Autenticación
  // ============================================

  /**
   * Registro de empresa con usuario administrador (HU-01)
   * POST /api/auth/signup
   */
  signup(signupRequest: SignupRequest): Observable<JwtAuthenticationResponse> {
    // En modo tests, no llamamos al backend: simulamos respuesta
    if (this.bypassAuth) {
      const fakeResponse: JwtAuthenticationResponse = {
        token: 'fake-token',
        usuario: {
          id: 1,
          nombre: signupRequest.usuario.nombre || 'Usuario Selenium',
          email: signupRequest.usuario.email,
          rol: UsuarioRol.ADMINISTRADOR,
          empresaId: 1,
          password: null
        }
      };
      this.saveSession(fakeResponse);

      return new Observable<JwtAuthenticationResponse>(observer => {
        observer.next(fakeResponse);
        observer.complete();
      });
    }

    // Flujo normal
    return this.http
      .post<JwtAuthenticationResponse>(`${this.apiUrl}/signup`, signupRequest)
      .pipe(tap(response => this.saveSession(response)));
  }

  /**
   * Inicio de sesión (HU-03)
   * POST /api/auth/login
   */
  login(loginDto: LoginDto): Observable<JwtAuthenticationResponse> {
    // En modo tests, simulamos login
    if (this.bypassAuth) {
      const fakeResponse: JwtAuthenticationResponse = {
        token: 'fake-token',
        usuario: {
          id: 1,
          nombre: 'Usuario Selenium',
          email: loginDto.correo,
          rol: UsuarioRol.ADMINISTRADOR,
          empresaId: 1,
          password: null
        }
      };
      this.saveSession(fakeResponse);

      return new Observable<JwtAuthenticationResponse>(observer => {
        observer.next(fakeResponse);
        observer.complete();
      });
    }

    // Flujo normal
    return this.http
      .post<JwtAuthenticationResponse>(`${this.apiUrl}/login`, loginDto)
      .pipe(tap(response => this.saveSession(response)));
  }

  /**
   * Cierra sesión y limpia sessionStorage
   */
  logout(): void {
    // Si quieres que el botón "Cerrar sesión" no haga nada en Selenium,
    // puedes hacer return aquí en modo bypass:
    // if (this.bypassAuth) { return; }

    if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
      Object.values(STORAGE_KEYS).forEach(key => {
        sessionStorage.removeItem(key);
      });
    }
    this.router.navigate(['/login']);
  }

  // ============================================
  // Verificaciones de Autenticación y Roles
  // ============================================

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    if (this.bypassAuth) {
      return true;
    }
    return !!this.token();
  }

  /**
   * Verifica si el usuario es ADMINISTRADOR
   */
  isAdministrador(): boolean {
    if (this.bypassAuth) {
      return true;
    }
    return this.role() === UsuarioRol.ADMINISTRADOR;
  }

  /**
   * Verifica si el usuario es EDITOR
   */
  isEditor(): boolean {
    if (this.bypassAuth) {
      return true;
    }
    return this.role() === UsuarioRol.EDITOR;
  }

  /**
   * Verifica si el usuario es SOLO_LECTURA
   */
  isSoloLectura(): boolean {
    if (this.bypassAuth) {
      return false;
    }
    return this.role() === UsuarioRol.SOLO_LECTURA;
  }

  /**
   * Verifica si el usuario puede editar (ADMINISTRADOR o EDITOR)
   */
  canEdit(): boolean {
    if (this.bypassAuth) {
      return true;
    }
    const rol = this.role();
    return rol === UsuarioRol.ADMINISTRADOR || rol === UsuarioRol.EDITOR;
  }

  // ============================================
  // Getters de Datos de Sesión
  // ============================================

  /**
   * Obtiene el token JWT
   */
  token(): string | null {
    if (this.bypassAuth) {
      return 'fake-token';
    }
    if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
      return sessionStorage.getItem(STORAGE_KEYS.JWT_TOKEN);
    }
    return null;
  }

  /**
   * Obtiene el rol del usuario
   */
  role(): string | null {
    if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
      return sessionStorage.getItem(STORAGE_KEYS.ROLE);
    }
    return null;
  }

  /**
   * Obtiene el email del usuario
   */
  email(): string | null {
    if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
      return sessionStorage.getItem(STORAGE_KEYS.EMAIL);
    }
    return null;
  }

  /**
   * Obtiene el nombre del usuario
   */
  nombre(): string | null {
    if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
      return sessionStorage.getItem(STORAGE_KEYS.NOMBRE);
    }
    return null;
  }

  /**
   * Obtiene el ID del usuario
   */
  idUsuario(): number | null {
    if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
      const id = sessionStorage.getItem(STORAGE_KEYS.ID_USUARIO);
      return id ? parseInt(id, 10) : null;
    }
    return null;
  }

  /**
   * Obtiene el ID de la empresa del usuario
   */
  empresaId(): number | null {
    if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
      const id = sessionStorage.getItem(STORAGE_KEYS.EMPRESA_ID);
      return id ? parseInt(id, 10) : null;
    }
    return null;
  }

  // ============================================
  // Métodos Privados - Gestión de Sesión
  // ============================================

  /**
   * Guarda la sesión en sessionStorage después de login/signup exitoso
   */
  private saveSession(response: JwtAuthenticationResponse): void {
    if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
      try {
        sessionStorage.setItem(STORAGE_KEYS.JWT_TOKEN, response.token);
        sessionStorage.setItem(STORAGE_KEYS.EMAIL, response.usuario.email);
        sessionStorage.setItem(STORAGE_KEYS.ROLE, response.usuario.rol);
        sessionStorage.setItem(STORAGE_KEYS.NOMBRE, response.usuario.nombre);
        sessionStorage.setItem(STORAGE_KEYS.ID_USUARIO, response.usuario.id.toString());
        sessionStorage.setItem(STORAGE_KEYS.EMPRESA_ID, response.usuario.empresaId.toString());
      } catch (error) {
        console.error('Error al guardar sesión:', error);
      }
    }
  }

  // ============================================
  // Métodos de Compatibilidad (Deprecated)
  // ============================================

  /**
   * @deprecated Usar isAuthenticated() en su lugar
   */
  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  /**
   * @deprecated Usar isAdministrador() en su lugar
   */
  isAdmin(): boolean {
    return this.isAdministrador();
  }

  /**
   * Obtiene el token JWT (alias de token())
   * @deprecated Usar token() en su lugar
   */
  getToken(): string | null {
    return this.token();
  }

  /**
   * Obtiene el usuario actual construido desde sessionStorage
   */
  getCurrentUser(): Usuario | null {
    if (!this.isAuthenticated()) {
      return null;
    }

    return new Usuario({
      id: this.idUsuario() || undefined,
      nombre: this.nombre() || '',
      correo: this.email() || '',
      rol: (this.role() as UsuarioRol) || UsuarioRol.SOLO_LECTURA,
      empresaId: this.empresaId() || 0
    });
  }
}
