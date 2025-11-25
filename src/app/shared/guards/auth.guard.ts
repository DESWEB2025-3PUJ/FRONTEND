import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { environment } from '../../../environments/environment';

/**
 * Guard de autenticación básica
 * Protege rutas que requieren que el usuario esté autenticado (cualquier rol)
 *
 * Comportamiento:
 * - Si environment.bypassAuth === true → siempre permite acceso (útil en tests)
 * - Si está autenticado → Permite acceso 
 * - Si NO está autenticado → Redirige a /login con returnUrl
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // BYPASS para entornos como environment.test.ts
  if ((environment as any).bypassAuth === true) {
    return true;
  }

  if (authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};

/**
 * Guard de administrador
 * Protege rutas solo para usuarios con rol ADMINISTRADOR
 *
 * Comportamiento:
 * - Si environment.bypassAdmin === true → siempre permite acceso (tests)
 * - Si NO está autenticado → Redirige a /login
 * - Si está autenticado pero NO es ADMINISTRADOR → Redirige a /home
 * - Si es ADMINISTRADOR → Permite acceso 
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // BYPASS para tests / entorno sin auth real
  if ((environment as any).bypassAdmin === true) {
    return true;
  }

  if (!authService.isAuthenticated()) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  if (authService.isAdministrador()) {
    return true;
  }

  router.navigate(['/home']);
  return false;
};

/**
 * Guard de editor
 * Protege rutas para usuarios con rol ADMINISTRADOR o EDITOR
 *
 * Comportamiento:
 * - Si environment.bypassEditor === true → siempre permite acceso (tests)
 * - Si NO está autenticado → Redirige a /login
 * - Si está autenticado pero es SOLO_LECTURA → Redirige a /home
 * - Si es ADMINISTRADOR o EDITOR (canEdit() === true) → Permite acceso 
 */
export const editorGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // BYPASS para tests
  if ((environment as any).bypassEditor === true) {
    return true;
  }

  if (!authService.isAuthenticated()) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  if (authService.canEdit()) {
    return true;
  }

  router.navigate(['/home']);
  return false;
};

