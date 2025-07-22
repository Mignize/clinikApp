import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError, shareReplay } from 'rxjs/operators';
import { environment } from './../../environments/environment';
import { decodeToken } from './jwt.util';

export interface UserProfile {
  id: number;
  email: string;
  full_name?: string;
  role: 'admin' | 'doctor' | 'patient';
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = environment.API_URL + '/auth';
  private user$ = new BehaviorSubject<UserProfile | null>(null);
  private profileLoaded = false;

  constructor(private http: HttpClient) {}

  loginAdmin(data: { email: string; password: string }) {
    return this.http
      .post<{ access_token: string }>(
        `${environment.API_URL}/auth/login-admin`,
        data
      )
      .pipe(
        tap((res) => {
          localStorage.setItem('token', res.access_token);
        })
      );
  }

  loginPatient(data: { email: string; password: string }) {
    return this.http
      .post<{ access_token: string }>(
        `${environment.API_URL}/auth/login-patient`,
        data
      )
      .pipe(
        tap((res) => {
          localStorage.setItem('token', res.access_token);
        })
      );
  }

  registerAdmin(data: {
    email: string;
    password: string;
    full_name: string;
    clinic_name: string;
  }) {
    return this.http
      .post<{ access_token: string }>(
        `${environment.API_URL}/auth/register-admin`,
        data
      )
      .pipe(
        tap((res) => {
          localStorage.setItem('token', res.access_token);
        })
      );
  }

  registerPatient(data: {
    email: string;
    password: string;
    full_name: string;
    clinic_id: number;
  }) {
    return this.http
      .post<{ access_token: string }>(
        `${environment.API_URL}/auth/register-patient`,
        data
      )
      .pipe(
        tap((res) => {
          localStorage.setItem('token', res.access_token);
        })
      );
  }

  logout() {
    localStorage.removeItem('token');
    this.user$.next(null);
    this.profileLoaded = false;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRoleFromToken(): string | null {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const token = this.getToken();
    if (!token) return null;
    const payload = decodeToken(token);
    return payload?.role || null;
  }

  getProfile(): Observable<UserProfile> {
    if (this.profileLoaded && this.user$.value) {
      return of(this.user$.value);
    }
    return this.http
      .get<UserProfile>(this.api.replace('/auth', '/user/me'))
      .pipe(
        tap((user) => {
          this.user$.next(user);
          this.profileLoaded = true;
        }),
        catchError((err) => {
          this.user$.next(null);
          this.profileLoaded = false;
          throw err;
        }),
        shareReplay(1)
      );
  }

  getClinics() {
    return this.http.get<any[]>(`${environment.API_URL}/clinics/`);
  }

  get user(): Observable<UserProfile | null> {
    return this.user$.asObservable();
  }
}
