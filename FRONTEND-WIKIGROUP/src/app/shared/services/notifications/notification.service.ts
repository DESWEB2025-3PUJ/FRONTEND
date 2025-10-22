import { Injectable } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  message: string;
  type: NotificationType;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  
  show(message: string, type: NotificationType = 'info', duration: number = 3000): void {
    // Por ahora usamos console, luego se puede integrar con una librería de UI
    const emoji = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    
    console.log(`${emoji[type]} ${message}`);
    
    // Aquí se puede integrar con Angular Material Snackbar, PrimeNG Toast, etc.
  }
  
  success(message: string, duration?: number): void {
    this.show(message, 'success', duration);
  }
  
  error(message: string, duration?: number): void {
    this.show(message, 'error', duration);
  }
  
  warning(message: string, duration?: number): void {
    this.show(message, 'warning', duration);
  }
  
  info(message: string, duration?: number): void {
    this.show(message, 'info', duration);
  }
}
