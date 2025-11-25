// src/app/shared/interceptors/error.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';
import { environment } from '../../../environments/environment';

/**
 * Interceptor de errores HTTP
 * Maneja errores de autenticación y autorización de forma centralizada
 *
 * Comportamiento normal (dev/prod):
 * - 401 (No autenticado) → Logout automático + redirigir a /login
 * - 403 (Sin permisos)   → Redirigir a /home con mensaje
 * - 404 (No encontrado)  → Mensaje específico
 * - 500 (Error servidor) → Mensaje genérico
 * - 0   (Sin conexión)   → Mensaje de conexión
 *
 * En entorno de tests (environment.bypassAuth === true o bypassApi === true):
 * - NO hace logout
 * - NO navega (no redirige)
 * - Solo reenvía el error hacia arriba para que el componente lo maneje
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // LOGS DETALLADOS PARA DEBUGGING
      console.group('🔴 Error HTTP Interceptado');
      console.log('URL:', req.url);
      console.log('Método:', req.method);
      console.log('Status:', error.status);
      console.log('Status Text:', error.statusText);
      console.log('Error completo:', error);
      console.log('Error body:', error.error);
      console.log('Headers:', error.headers);
      console.groupEnd();

      // En modo tests (bypass), no hagas side-effects (logout, navigate, etc.)
      if ((environment as any).bypassAuth === true || (environment as any).bypassApi === true) {
        console.warn('⚠️ Modo bypass activado - no se ejecutan side effects');
        return throwError(() => error);
      }

      let errorMessage = 'Ha ocurrido un error inesperado';

      switch (error.status) {
        case 401:
          console.error('❌ Error 401: No autenticado. Cerrando sesión...');
          errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
          authService.logout();
          break;

        case 403:
          console.error('❌ Error 403: Sin permisos para esta acción');
          errorMessage = 'No tienes permisos para realizar esta acción.';
          router.navigate(['/home']);
          break;

        case 404:
          console.error('❌ Error 404: Recurso no encontrado');
          errorMessage = error.error?.message || 'El recurso solicitado no fue encontrado.';
          break;

        case 500:
          console.error('❌ Error 500: Error interno del servidor');
          errorMessage = error.error?.message || 'Error interno del servidor. Por favor, intenta más tarde.';
          break;

        case 0:
          console.error('❌ Error de conexión (status 0): No se pudo conectar con el servidor');
          console.error('Posibles causas:');
          console.error('  - El servidor backend no está corriendo');
          console.error('  - Problemas de CORS');
          console.error('  - URL incorrecta:', environment.apiUrl);
          console.error('  - Firewall o red bloqueando la conexión');
          errorMessage = 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo en ' + environment.apiUrl;
          break;

        default:
          console.error(`❌ Error ${error.status}:`, error.error);
          errorMessage = error.error?.message || `Error ${error.status}: ${error.statusText}`;
      }

      return throwError(() => ({
        status: error.status,
        message: errorMessage,
        error: error.error,
        originalError: error
      }));
    })
  );
};
