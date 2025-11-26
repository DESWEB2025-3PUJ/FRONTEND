import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Configuración de rutas del servidor para SSR/Prerendering
 * 
 * RenderMode.Prerender: Pre-genera HTML estático en build time (rutas sin parámetros)
 * RenderMode.Server: Renderiza en el servidor bajo demanda (rutas con parámetros dinámicos)
 */
export const serverRoutes: ServerRoute[] = [
  // Rutas con parámetros dinámicos - Renderizado en servidor
  {
    path: 'empresas/editar/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'procesos/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'procesos/editar/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'procesos/:id/diagrama',
    renderMode: RenderMode.Server
  },
  {
    path: 'procesos/:procesoId/actividades',
    renderMode: RenderMode.Server
  },
  {
    path: 'procesos/:procesoId/actividades/nueva',
    renderMode: RenderMode.Server
  },
  {
    path: 'procesos/:procesoId/actividades/editar/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'usuarios/empresa/:empresaId',
    renderMode: RenderMode.Server
  },
  {
    path: 'usuarios/crear/:empresaId',
    renderMode: RenderMode.Server
  },
  {
    path: 'usuarios/:id/editar',
    renderMode: RenderMode.Server
  },
  {
    path: 'roles/editar/:id',
    renderMode: RenderMode.Server
  },
  // Rutas estáticas - Pre-renderizadas
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
