import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { AuthService, UserProfile } from './auth/auth.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  user$: Observable<UserProfile | null>;
  showNavbar = true;

  constructor(private auth: AuthService, private router: Router) {
    this.user$ = this.auth.user;
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((event: any) => {
        const url = event.urlAfterRedirects || event.url;
        this.showNavbar =
          !url.startsWith('/auth/login') && !url.startsWith('/auth/register');
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
