import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';

/**
 * Interceptor de errores HTTP
 * Maneja errores de autenticación y autorización de forma centralizada
 * 
 * Comportamiento:
 * - 401 (No autenticado) → Logout automático + Redirigir a /login
 * - 403 (Sin permisos) → Mostrar mensaje "No tienes permisos"
 * - 404 (No encontrado) → Mostrar mensaje específico
 * - 500 (Error servidor) → Mostrar mensaje genérico
 * - Otros → Mostrar mensaje con detalles del error
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ha ocurrido un error inesperado';

      switch (error.status) {
        case 401:
          // No autenticado - Hacer logout y redirigir a login
          console.error('Error 401: No autenticado. Cerrando sesión...');
          errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
          authService.logout();
          break;

        case 403:
          // Sin permisos - Mostrar mensaje
          console.error('Error 403: Sin permisos para esta acción');
          errorMessage = 'No tienes permisos para realizar esta acción.';
          router.navigate(['/home']);
          break;

        case 404:
          // No encontrado
          console.error('Error 404: Recurso no encontrado');
          errorMessage = error.error?.message || 'El recurso solicitado no fue encontrado.';
          break;

        case 500:
          // Error del servidor
          console.error('Error 500: Error interno del servidor');
          errorMessage = 'Error interno del servidor. Por favor, intenta más tarde.';
          break;

        case 0:
          // Error de conexión
          console.error('Error de conexión: No se pudo conectar con el servidor');
          errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
          break;

        default:
          // Otros errores
          console.error(`Error ${error.status}:`, error.error);
          errorMessage = error.error?.message || `Error ${error.status}: ${error.statusText}`;
      }

      // Retornar el error con el mensaje formateado
      return throwError(() => ({
        status: error.status,
        message: errorMessage,
        error: error.error
      }));
    })
  );
};
