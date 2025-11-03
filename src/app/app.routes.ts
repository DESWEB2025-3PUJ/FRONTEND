import { Routes } from '@angular/router';
import { authGuard, adminGuard, editorGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./components/home/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./components/usuario/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/usuario/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'empresas',
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./components/empresa/empresa-list/empresa-list.component').then(m => m.EmpresaListComponent)
      },
      {
        path: 'nueva',
        loadComponent: () => import('./components/empresa/empresa-form/empresa-form.component').then(m => m.EmpresaFormComponent)
      },
      {
        path: 'editar/:id',
        loadComponent: () => import('./components/empresa/empresa-form/empresa-form.component').then(m => m.EmpresaFormComponent)
      }
    ]
  },
  {
    path: 'procesos',
//    canActivate: [authGuard],
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
  {
  path: 'proceso/diagram',
  loadComponent: () =>
    import('./components/proceso/proceso-diagram/proceso-diagram.component')
      .then(m => m.ProcesoDiagramComponent)
},
  {
    path: '**',
    redirectTo: '/home'
  }
];
