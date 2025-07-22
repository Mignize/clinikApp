import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Appointment } from '../types/appointment.type';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private apiUrl = environment.API_URL + '/appointments';

  constructor(private http: HttpClient) {}

  getAppointments(params?: any): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(this.apiUrl, { params });
  }

  getAppointmentById(id: string): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.apiUrl}/${id}`);
  }

  createAppointment(data: Partial<Appointment>): Observable<Appointment> {
    return this.http.post<Appointment>(this.apiUrl, data);
  }

  updateAppointment(
    id: string,
    data: Partial<Appointment>
  ): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.apiUrl}/${id}`, data);
  }

  deleteAppointment(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
