import { Routes } from '@angular/router';
import { authGuard, adminGuard, editorGuard } from './shared/guards/auth.guard';

/**
 * Configuración de rutas de la aplicación con guards de protección
 * 
 * Rutas públicas (sin autenticación):
 * - /login - Inicio de sesión
 * - /register - Registro de empresa
 * 
 * Rutas con authGuard (requieren login - cualquier rol):
 * - /home
 * - /empresas/* (ver empresas)
 * - /procesos/* (ver procesos)
 * 
 * Rutas con editorGuard (ADMINISTRADOR o EDITOR):
 * - /procesos/nuevo, /procesos/:id/editar
 * - /actividades/nueva, /actividades/:id/editar
 * - /roles/* (gestión de roles)
 * 
 * Rutas con adminGuard (solo ADMINISTRADOR):
 * - /usuarios/* (gestión de usuarios)
 * - /empresas/nueva, /empresas/:id/editar (crear/editar empresas)
 */
export const routes: Routes = [
  // ============================================
  // Ruta raíz - Redirige a login
  // ============================================
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },

  // ============================================
  // Rutas Públicas (sin autenticación)
  // ============================================
  {
    path: 'login',
    loadComponent: () => import('./components/usuario/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/usuario/register/register.component').then(m => m.RegisterComponent)
  },

  // ============================================
  // Rutas Protegidas - authGuard (cualquier rol)
  // ============================================
  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () => import('./components/home/home/home.component').then(m => m.HomeComponent)
  },

  // ============================================
  // Empresas - Requiere autenticación
  // Ver empresas: Todos los roles
  // Crear/Editar: Solo ADMINISTRADOR
  // ============================================
  {
    path: 'empresas',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./components/empresa/empresa-list/empresa-list.component').then(m => m.EmpresaListComponent)
      },
      {
        path: 'nueva',
        canActivate: [adminGuard],
        loadComponent: () => import('./components/empresa/empresa-form/empresa-form.component').then(m => m.EmpresaFormComponent)
      },
      {
        path: 'editar/:id',
        canActivate: [adminGuard],
        loadComponent: () => import('./components/empresa/empresa-form/empresa-form.component').then(m => m.EmpresaFormComponent)
      }
    ]
  },

  // ============================================
  // Procesos - Requiere autenticación
  // Ver: Todos los roles
  // Crear/Editar: ADMINISTRADOR o EDITOR
  // ============================================
  {
    path: 'procesos',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./components/proceso/proceso-list/proceso-list.component').then(m => m.ProcesoListComponent)
      },
      {
        path: 'nuevo',
        canActivate: [editorGuard],
        loadComponent: () => import('./components/proceso/proceso-form/proceso-form.component').then(m => m.ProcesoFormComponent)
      },
      {
        path: 'editar/:id',
        canActivate: [editorGuard],
        loadComponent: () => import('./components/proceso/proceso-form/proceso-form.component').then(m => m.ProcesoFormComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./components/proceso/proceso-detail/proceso-detail.component').then(m => m.ProcesoDetailComponent)
      },
      {
        path: ':id/diagrama',
        loadComponent: () => import('./components/proceso/proceso-diagram/proceso-diagram.component').then(m => m.ProcesoDiagramComponent)
      },
      {
        path: ':procesoId/actividades',
        children: [
          {
            path: '',
            loadComponent: () => import('./components/actividad/actividad-list/actividad-list.component').then(m => m.ActividadListComponent)
          },
          {
            path: 'nueva',
            canActivate: [editorGuard],
            loadComponent: () => import('./components/actividad/actividad-form/actividad-form.component').then(m => m.ActividadFormComponent)
          },
          {
            path: 'editar/:id',
            canActivate: [editorGuard],
            loadComponent: () => import('./components/actividad/actividad-form/actividad-form.component').then(m => m.ActividadFormComponent)
          }
        ]
      }
    ]
  },

  // ============================================
  // Usuarios - Solo ADMINISTRADOR
  // ============================================
  {
    path: 'usuarios',
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: 'empresa/:empresaId',
        loadComponent: () => import('./components/usuario/login/login.component').then(m => m.LoginComponent)
        // TODO: Crear componente UsuariosListComponent
      },
      {
        path: 'crear/:empresaId',
        loadComponent: () => import('./components/usuario/login/login.component').then(m => m.LoginComponent)
        // TODO: Crear componente UsuarioCreateComponent
      },
      {
        path: ':id/editar',
        loadComponent: () => import('./components/usuario/login/login.component').then(m => m.LoginComponent)
        // TODO: Crear componente UsuarioEditComponent
      }
    ]
  },

  // ============================================
  // Roles - ADMINISTRADOR o EDITOR
  // ============================================
  {
    path: 'roles',
    canActivate: [authGuard, editorGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./components/role/role-list/role-list.component').then(m => m.RoleListComponent)
      },
      {
        path: 'nuevo',
        loadComponent: () => import('./components/role/role-form/role-form.component').then(m => m.RoleFormComponent)
      },
      {
        path: 'editar/:id',
        loadComponent: () => import('./components/role/role-form/role-form.component').then(m => m.RoleFormComponent)
      }
    ]
  },

  // ============================================
  // Diagrama de proceso (temporal - deprecar)
  // ============================================
  {
    path: 'proceso/diagram',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/proceso/proceso-diagram/proceso-diagram.component')
        .then(m => m.ProcesoDiagramComponent)
  },

  // ============================================
  // Ruta 404 - Redirige a home
  // ============================================
  {
    path: '**',
    redirectTo: '/login'
  }
];
