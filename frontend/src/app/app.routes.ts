import { Routes } from '@angular/router';
import { RoleGuard } from './auth/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./landing.component').then((m) => m.LandingComponent),
  },
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'auth/register',
    loadComponent: () =>
      import('./auth/register/register.component').then(
        (m) => m.RegisterComponent
      ),
  },
  {
    path: 'auth/register-patient',
    loadComponent: () =>
      import('./auth/register/register-patient.component').then(
        (m) => m.RegisterPatientComponent
      ),
  },
  {
    path: 'auth/login-patient',
    loadComponent: () =>
      import('./auth/login/login-patient.component').then(
        (m) => m.LoginPatientComponent
      ),
  },
  {
    path: 'dashboard/patient',
    loadComponent: () =>
      import('./dashboard/patient/patient-dashboard.component').then(
        (m) => m.PatientDashboardComponent
      ),
    canMatch: [RoleGuard],
    data: { role: 'patient' },
  },
  {
    path: 'dashboard/doctor',
    loadComponent: () =>
      import('./dashboard/doctor/doctor-dashboard.component').then(
        (m) => m.DoctorDashboardComponent
      ),
    canMatch: [RoleGuard],
    data: { role: 'doctor' },
  },
  {
    path: 'dashboard/admin',
    loadComponent: () =>
      import('./dashboard/admin/admin-dashboard.component').then(
        (m) => m.AdminDashboardComponent
      ),
    canMatch: [RoleGuard],
    data: { role: 'admin' },
  },
];
