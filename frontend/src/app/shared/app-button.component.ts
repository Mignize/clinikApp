import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [ngClass]="[
        'flex items-center justify-center gap-2 font-semibold rounded transition-all shadow',
        variant === 'primary'
          ? 'bg-purple-600 hover:bg-purple-800 text-white'
          : '',
        variant === 'secondary'
          ? 'bg-gray-200 hover:bg-gray-300 text-gray-800'
          : '',
        variant === 'danger' ? 'bg-red-600 hover:bg-red-800 text-white' : '',
        size === 'sm'
          ? 'px-3 py-1 text-xs'
          : size === 'lg'
          ? 'px-6 py-3 text-lg'
          : 'px-4 py-2 text-sm',
        'cursor-pointer',
        loading || disabled ? 'opacity-50 cursor-not-allowed' : ''
      ]"
      [disabled]="disabled || loading"
      (click)="onClick.emit($event)"
      [type]="type"
    >
      <ng-content select="[icon]"></ng-content>
      @if (loading) {
      <svg
        class="animate-spin h-5 w-5 mr-2 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v8z"
        ></path>
      </svg>
      }
      <ng-content></ng-content>
    </button>
  `,
  styles: [``],
})
export class AppButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'danger' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() loading = false;
  @Input() disabled = false;
  @Input() type: 'button' | 'submit' = 'button';
  @Output() onClick = new EventEmitter<Event>();
}
