import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-landing',
  templateUrl: './landing.component.html',
})
export class LandingComponent implements OnInit {
  currentYear = new Date().getFullYear();
  constructor(private router: Router) {}
  ngOnInit() {}
  goToPatientLogin() {
    this.router.navigate(['/auth/login-patient']);
  }
  goToPatientRegister() {
    this.router.navigate(['/auth/register-patient']);
  }
  goToAdminLogin() {
    this.router.navigate(['/auth/login']);
  }
  goToAdminRegister() {
    this.router.navigate(['/auth/register']);
  }
}
