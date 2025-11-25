// src/app/shared/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import { environment } from '../../../environments/environment';

/**
 * Interceptor de autenticación JWT
 * Añade automáticamente el token JWT a todas las peticiones HTTP
 *
 * Comportamiento:
 * 1. En entorno de pruebas (environment.bypassAuth === true) → NO añade token
 * 2. En entornos normales:
 *    - Obtiene el token mediante AuthService.token()
 *    - Si hay token → Clona la request y añade header: Authorization: Bearer <token>
 *    - Si NO hay token → Envía la request sin modificar (para endpoints públicos)
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // BYPASS PARA SELENIUM / environment.test.ts
  // No añadimos token, dejamos pasar la petición tal cual
  if ((environment as any).bypassAuth === true) {
    return next(req);
  }

  const token = authService.token();

  // Si hay token, añadirlo al header Authorization
  if (token) {
    const clonedRequest = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(clonedRequest);
  }

  // Si no hay token, enviar request sin modificar (endpoints públicos)
  return next(req);
};
