import { Component } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  template: `
    <div class="bg-white rounded-xl shadow-lg p-6">
      <ng-content></ng-content>
    </div>
  `,
  styles: [``],
})
export class AppCardComponent {}
