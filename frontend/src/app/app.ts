import { Component, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { AuthService } from './auth/auth.service';
import { filter } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  user;
  showNavbar;

  constructor(private auth: AuthService, private router: Router) {
    this.user = toSignal(this.auth.user, { initialValue: null });
    this.showNavbar = signal(true);
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((event: any) => {
        const url = event.urlAfterRedirects || event.url;
        this.showNavbar.set(
          !url.startsWith('/auth/login') && !url.startsWith('/auth/register')
        );
      });
  }

  get role(): string | null {
    return this.auth.getRoleFromToken();
  }

  logout() {
    const role = this.role;
    this.auth.logout();

    if (role === 'patient') {
      this.router.navigate(['/auth/login-patient']);
    } else {
      this.router.navigate(['/auth/login']);
    }
  }
}
