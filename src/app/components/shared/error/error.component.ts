import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error',
  imports: [CommonModule],
  templateUrl: './error.component.html',
  styleUrl: './error.component.css'
})
export class ErrorComponent {
  message = input.required<string>();
  showRetry = input<boolean>(false);
  retry = output<void>();

  onRetry() {
    this.retry.emit();
  }
}

