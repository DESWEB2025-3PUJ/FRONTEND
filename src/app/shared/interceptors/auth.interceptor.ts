import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';

/**
 * Interceptor de autenticación JWT
 * Añade automáticamente el token JWT a todas las peticiones HTTP
 * 
 * Comportamiento:
 * 1. Obtiene el token de sessionStorage mediante AuthService
 * 2. Si hay token → Clona la request y añade header: Authorization: Bearer <token>
 * 3. Si NO hay token → Envía la request sin modificar (para endpoints públicos)
 * 4. Continúa con next(request)
 * 
 * Endpoints públicos (sin token):
 * - POST /api/auth/signup
 * - POST /api/auth/register
 * - POST /api/auth/login
 * 
 * Endpoints protegidos (requieren token):
 * - Todos los demás endpoints del backend
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
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
