import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
    @if (open) {
    <div
      class="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
    >
      <div
        class="absolute inset-0 bg-black/30 backdrop-blur-sm"
        (click)="close.emit()"
      ></div>
      <div
        class="relative bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg animate-slide-up"
      >
        <button
          (click)="close.emit()"
          class="absolute top-3 right-3 text-gray-500 hover:text-red-600 text-xl font-bold"
        >
          &times;
        </button>
        <ng-content></ng-content>
      </div>
    </div>
    }
  `,
  styles: [``],
})
export class AppModalComponent {
  @Input() open = false;
  @Output() close = new EventEmitter<void>();
}
