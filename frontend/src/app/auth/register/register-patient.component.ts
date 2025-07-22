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
import { MatSelectModule } from '@angular/material/select';

@Component({
  standalone: true,
  selector: 'app-register-patient',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule,
    MatSelectModule,
    RouterModule,
  ],
  templateUrl: './register-patient.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterPatientComponent {
  registerForm: FormGroup;
  loading = false;
  clinics: any[] = [];
  ngOnInit() {
    this.auth.getClinics().subscribe({
      next: (clinics) => {
        this.clinics = clinics;
      },
      error: () => {
        this.clinics = [];
      },
    });
  }

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
      clinic_id: ['', [Validators.required]],
      role: ['patient'],
    });
  }

  submit() {
    if (this.registerForm.invalid) return;
    this.loading = true;
    this.auth.registerPatient(this.registerForm.value).subscribe({
      next: () => {
        this.auth.getProfile().subscribe({
          next: (user) => {
            this.snackBar.open('Registro exitoso', 'Cerrar', {
              duration: 2000,
              panelClass: ['bg-success', 'text-white'],
            });
            this.router.navigate(['/dashboard/patient']);
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
