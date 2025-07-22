import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule,
    RouterModule,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      full_name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['admin'],
      clinic_name: ['', [Validators.required]],
    });
  }

  submit() {
    if (this.registerForm.invalid) return;
    this.loading = true;
    const data = {
      ...this.registerForm.value,
      clinic_name: this.registerForm.value.clinic_name,
    };
    this.auth.registerAdmin(data).subscribe({
      next: () => {
        this.auth.getProfile().subscribe({
          next: (user) => {
            this.snackBar.open('Registro exitoso', 'Cerrar', {
              duration: 2000,
              panelClass: ['bg-success', 'text-white'],
            });
            if (user.role === 'doctor') {
              this.router.navigate(['/dashboard/doctor']);
            } else if (user.role === 'admin') {
              this.router.navigate(['/dashboard/admin']);
            } else if (user.role === 'patient') {
              this.router.navigate(['/dashboard/patient']);
            } else {
              this.snackBar.open('Rol desconocido', 'Cerrar', {
                duration: 3000,
                panelClass: ['bg-danger', 'text-white'],
              });
            }
            this.loading = false;
          },
          error: (err) => {
            this.snackBar.open('No se pudo obtener el perfil', 'Cerrar', {
              duration: 3000,
              panelClass: ['bg-danger', 'text-white'],
            });
            this.loading = false;
          },
        });
      },
      error: (err: any) => {
        this.snackBar.open(
          err.error?.detail || 'Error en el registro',
          'Cerrar',
          { duration: 3000, panelClass: ['bg-danger', 'text-white'] }
        );
        this.loading = false;
      },
    });
  }
}
