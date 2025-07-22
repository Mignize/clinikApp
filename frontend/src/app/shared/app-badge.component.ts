import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      [ngClass]="[
        'px-2 py-1 rounded-full text-xs font-bold drop-shadow',
        type === 'success'
          ? 'bg-green-200 text-green-900 border border-green-400'
          : '',
        type === 'danger'
          ? 'bg-red-200 text-red-900 border border-red-400'
          : '',
        type === 'warning'
          ? 'bg-yellow-100 text-yellow-800 border border-yellow-400'
          : '',
        type === 'info'
          ? 'bg-blue-100 text-blue-800 border border-blue-400'
          : '',
        type === 'neutral'
          ? 'bg-gray-200 text-gray-800 border border-gray-400'
          : ''
      ]"
    >
      <ng-content></ng-content>
    </span>
  `,
  styles: [``],
})
export class AppBadgeComponent {
  @Input() type: 'success' | 'danger' | 'warning' | 'info' | 'neutral' =
    'neutral';
}
