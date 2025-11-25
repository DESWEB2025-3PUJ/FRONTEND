import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

/**
 * Guard de autenticación básica
 * Protege rutas que requieren que el usuario esté autenticado (cualquier rol)
 * 
 * Comportamiento:
 * - Si NO está autenticado → Redirige a /login
 * - Si está autenticado → Permite acceso ✅
 * 
 * Uso: Protege home, /empresas/*, /procesos/*, etc.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // No autenticado - redirigir a login con URL de retorno
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};

/**
 * Guard de administrador
 * Protege rutas solo para usuarios con rol ADMINISTRADOR
 * 
 * Comportamiento:
 * - Si NO está autenticado → Redirige a /login
 * - Si está autenticado pero NO es ADMINISTRADOR → Redirige a /home con mensaje
 * - Si es ADMINISTRADOR → Permite acceso ✅
 * 
 * Uso: /usuarios/crear, /usuarios/:id/editar, /empresas/crear, /empresas/:id/eliminar
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar si está autenticado
  if (!authService.isAuthenticated()) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // Verificar si es administrador
  if (authService.isAdministrador()) {
    return true;
  }

  // No tiene permisos de administrador
  router.navigate(['/home']);
  return false;
};

/**
 * Guard de editor
 * Protege rutas para usuarios con rol ADMINISTRADOR o EDITOR
 * 
 * Comportamiento:
 * - Si NO está autenticado → Redirige a /login
 * - Si está autenticado pero es SOLO_LECTURA → Redirige a /home con mensaje
 * - Si es ADMINISTRADOR o EDITOR → Permite acceso ✅
 * 
 * Uso: /procesos/crear, /procesos/:id/editar, /actividades/crear, /actividades/:id/editar
 */
export const editorGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar si está autenticado
  if (!authService.isAuthenticated()) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // Verificar si puede editar (ADMINISTRADOR o EDITOR)
  if (authService.canEdit()) {
    return true;
  }

  // No tiene permisos de edición
  router.navigate(['/home']);
  return false;
};
