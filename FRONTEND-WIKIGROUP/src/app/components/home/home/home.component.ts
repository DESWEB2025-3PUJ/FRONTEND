import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../shared/services/auth/auth.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  authService = inject(AuthService);
  
  features = [
    {
      icon: '🏢',
      title: 'Gestión de Empresas',
      description: 'Administra múltiples empresas con sus propios espacios de trabajo independientes.'
    },
    {
      icon: '📊',
      title: 'Procesos Empresariales',
      description: 'Documenta y visualiza los procesos de tu organización de manera clara y estructurada.'
    },
    {
      icon: '👥',
      title: 'Control de Acceso',
      description: 'Define roles y permisos para controlar quién puede ver y editar los procesos.'
    },
    {
      icon: '🔄',
      title: 'Flujos de Trabajo',
      description: 'Crea diagramas con actividades, gateways y conexiones para representar tus procesos.'
    },
    {
      icon: '📝',
      title: 'Historial de Cambios',
      description: 'Mantén un registro completo de todas las modificaciones realizadas en los procesos.'
    },
    {
      icon: '🎯',
      title: 'Roles de Proceso',
      description: 'Define roles organizacionales y asígnalos a las actividades de tus procesos.'
    }
  ];
}
