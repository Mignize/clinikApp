import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Clinic } from '../types/clinic.type';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ClinicService {
  private apiUrl = environment.API_URL + '/appointments';

  constructor(private http: HttpClient) {}

  getClinics(params?: any): Observable<Clinic[]> {
    return this.http.get<Clinic[]>(this.apiUrl, { params });
  }

  getClinicById(id: string): Observable<Clinic> {
    return this.http.get<Clinic>(`${this.apiUrl}/${id}`);
  }

  createClinic(data: Partial<Clinic>): Observable<Clinic> {
    return this.http.post<Clinic>(this.apiUrl, data);
  }
}
