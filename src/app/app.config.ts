import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { authInterceptor } from './shared/interceptors/auth.interceptor';
import { errorInterceptor } from './shared/interceptors/error.interceptor';

/**
 * Configuración global de la aplicación Angular 18+
 * 
 * Interceptors configurados (orden importa):
 * 1. authInterceptor - Añade token JWT a todas las peticiones
 * 2. errorInterceptor - Maneja errores HTTP de forma centralizada (401, 403, 404, 500)
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        authInterceptor,    // 1º - Añade token a peticiones
        errorInterceptor    // 2º - Maneja errores
      ])
    )
  ]
};
