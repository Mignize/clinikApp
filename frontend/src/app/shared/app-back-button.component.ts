import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-back-button',
  imports: [RouterModule],
  template: `
    <a
      routerLink="/"
      class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow hover:bg-purple-50 text-purple-700 font-semibold transition absolute top-6 left-6 z-20"
    >
      <span class="material-icons text-lg">arrow_back</span>
      Volver a inicio
    </a>
  `,
  styles: [``],
})
export class AppBackButtonComponent {}
