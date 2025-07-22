import { Component, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../auth.service';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  standalone: true,
  selector: 'app-login-patient',
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule,
    RouterModule,
  ],
  templateUrl: './login-patient.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginPatientComponent {
  loginForm: FormGroup;
  loading = signal(false);

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  submit() {
    if (this.loginForm.invalid) return;
    this.loading.set(true);
    this.auth.loginPatient(this.loginForm.value).subscribe({
      next: () => {
        this.auth.getProfile().subscribe({
          next: (user) => {
            this.snackBar.open('Bienvenido/a', 'Cerrar', {
              duration: 2000,
              panelClass: ['bg-success', 'text-white'],
            });
            this.router.navigate(['/dashboard/patient']);
            this.loading.set(false);
          },
          error: (err) => {
            this.snackBar.open('No se pudo obtener el perfil', 'Cerrar', {
              duration: 3000,
              panelClass: ['bg-danger', 'text-white'],
            });
            this.loading.set(false);
          },
        });
      },
      error: (err: any) => {
        this.snackBar.open(
          err.error?.detail || 'Credenciales inválidas',
          'Cerrar',
          { duration: 3000, panelClass: ['bg-danger', 'text-white'] }
        );
        this.loading.set(false);
      },
    });
  }
}
