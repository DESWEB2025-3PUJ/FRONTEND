import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap, catchError } from 'rxjs';
import { Usuario, UsuarioRol } from '../../../models';
import { environment } from '../../../../environments/environment';
import { ErrorHandlerService } from '../http/error-handler.service';

export interface LoginRequest {
  correo: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);
  private router = inject(Router);
  private errorHandler = inject(ErrorHandlerService);
  private platformId = inject(PLATFORM_ID);

  private apiUrl = `${environment.apiUrl}/auth`;

  private currentUserSubject = new BehaviorSubject<Usuario | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private tokenKey = 'auth_token';
  private userKey = 'current_user';

  // BYPASS AUTH PARA PRUEBAS SELENIUM
  private bypassAuth = environment.bypassAuth === true;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadUserFromStorage();
    }

    // Si bypassAuth está activo → simular usuario logueado
    if (this.bypassAuth) {
      const fakeUser = new Usuario({
        id: 1,
        nombre: 'Usuario Selenium',
        correo: 'selenium@test.com',
        rol: UsuarioRol.ADMINISTRADOR,
        empresaId: 1
      });

      this.setSession({
        token: 'fake-token',
        usuario: fakeUser
      });
    }
  }

  login(correo: string, password: string): Observable<LoginResponse> {
    if (this.bypassAuth) {
      const fakeUser = new Usuario({
        id: 1,
        nombre: 'Usuario Selenium',
        correo,
        rol: UsuarioRol.ADMINISTRADOR,
        empresaId: 1
      });

      const response: LoginResponse = {
        token: 'fake-token',
        usuario: fakeUser
      };

      this.setSession(response);

      return new Observable<LoginResponse>(obs => {
        obs.next(response);
        obs.complete();
      });
    }

    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { correo, password }).pipe(
      tap(response => this.setSession(response)),
      catchError(this.errorHandler.handleError)
    );
  }

  register(empresa: any, usuario: any): Observable<LoginResponse> {
    if (this.bypassAuth) {
      const fakeUser = new Usuario({
        ...usuario,
        rol: 'ADMINISTRADOR',
        empresaId: usuario.empresaId || 1
      });

      const response: LoginResponse = {
        token: 'fake-token',
        usuario: fakeUser
      };

      this.setSession(response);

      return new Observable<LoginResponse>(obs => {
        obs.next(response);
        obs.complete();
      });
    }

    return this.http.post<LoginResponse>(`${this.apiUrl}/register`, { empresa, usuario }).pipe(
      tap(response => this.setSession(response)),
      catchError(this.errorHandler.handleError)
    );
  }

  logout(): void {
    if (this.bypassAuth) return;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  private setSession(authResult: LoginResponse): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.tokenKey, authResult.token);
      localStorage.setItem(this.userKey, JSON.stringify(authResult.usuario));
    }
    this.currentUserSubject.next(new Usuario(authResult.usuario));
  }

  private loadUserFromStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      const userJson = localStorage.getItem(this.userKey);
      if (userJson) {
        const user = JSON.parse(userJson);
        this.currentUserSubject.next(new Usuario(user));
      }
    }
  }

  getToken(): string | null {
    if (this.bypassAuth) return 'fake-token';
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  getCurrentUser(): Usuario | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    if (this.bypassAuth) return true;
    return !!this.getToken();
  }

  isAdmin(): boolean {
    if (this.bypassAuth) return true;
    return this.currentUserSubject.value?.rol === 'ADMINISTRADOR';
  }

  canEdit(): boolean {
    if (this.bypassAuth) return true;
    const rol = this.currentUserSubject.value?.rol;
    return rol === 'ADMINISTRADOR' || rol === 'EDITOR';
  }
}
