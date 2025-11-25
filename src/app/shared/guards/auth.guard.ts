import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { environment } from '../../../environments/environment';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // BYPASS
  if (environment.bypassAuth) return true;

  if (authService.isLoggedIn()) return true;

  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (environment.bypassAdmin) return true;

  if (authService.isLoggedIn() && authService.isAdmin()) return true;

  router.navigate(['/']);
  return false;
};

export const editorGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (environment.bypassEditor) return true;

  if (authService.isLoggedIn() && authService.canEdit()) return true;

  router.navigate(['/']);
  return false;
};
