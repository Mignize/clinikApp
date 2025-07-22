import { Component, OnInit, signal, computed } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { DatePipe, TitleCasePipe } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { Appointment } from '../../types/appointment.type';
import { StatusLabelPipe } from '../../pipes/status-label.pipe';
import { DateFormatPipe } from '../../pipes/date-format.pipe';
import { AppointmentService } from '../../services/appointment.service';
import { AppButtonComponent } from '../../shared/app-button.component';
import { AppModalComponent } from '../../shared/app-modal.component';
import { AppCardComponent } from '../../shared/app-card.component';
import { AppBadgeComponent } from '../../shared/app-badge.component';
import { MedicalRecord } from '../../types/medical-record.type';

interface Patient {
  id: number;
  full_name: string;
  email: string;
}

@Component({
  standalone: true,
  selector: 'app-doctor-dashboard',
  imports: [
    TitleCasePipe,
    ReactiveFormsModule,
    FormsModule,
    DatePipe,
    StatusLabelPipe,
    DateFormatPipe,
    AppButtonComponent,
    AppModalComponent,
    AppCardComponent,
    AppBadgeComponent,
  ],
  providers: [DatePipe],
  templateUrl: './doctor-dashboard.component.html',
})
export class DoctorDashboardComponent implements OnInit {
  user;
  appointments = signal<Appointment[]>([]);
  patients = signal<Patient[]>([]);
  showAppointmentModal = signal(false);
  selectedAppointment = signal<Appointment | null>(null);
  appointmentForm: FormGroup;
  appointmentLoading = signal(false);
  appointmentError = signal<string | null>(null);
  appointmentImages = signal<string[]>([]);
  showPatientHistory = signal(false);
  selectedPatient = signal<Patient | null>(null);
  patientHistoryLoading = signal(false);
  patientHistoryError = signal<string | null>(null);
  patientMedicalRecords = signal<MedicalRecord[]>([]);
  selectedMedicalRecord = signal<MedicalRecord | null>(null);
  medicalRecordLoading = signal(false);
  medicalRecordError = signal<string | null>(null);

  todayAppointments = computed(() => {
    const today = new Date().toISOString().slice(0, 10);
    return this.appointments().filter(
      (a) =>
        typeof a.appointment_date === 'string' &&
        a.appointment_date.slice(0, 10) === today
    );
  });
  totalPatients = computed(() => this.patients().length);
  totalAppointments = computed(() => this.appointments().length);
  totalTodayAppointments = computed(() => this.todayAppointments().length);

  upcomingAppointments = computed(() => {
    const now = new Date();
    return this.appointments().filter(
      (a) => a.status === 'scheduled' && new Date(a.appointment_date) > now
    );
  });
  completedAppointments = computed(() =>
    this.appointments().filter((a) => a.status === 'completed')
  );
  cancelledAppointments = computed(() =>
    this.appointments().filter((a) => a.status === 'cancelled')
  );

  constructor(
    private auth: AuthService,
    private appointmentService: AppointmentService,
    private http: HttpClient,
    private fb: FormBuilder
  ) {
    this.user = toSignal(this.auth.user, { initialValue: null });
    this.appointmentForm = this.fb.group({
      notes: ['', [Validators.required]],
      diagnosis: ['', [Validators.required]],
      treatment: ['', [Validators.required]],
      symptoms: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    this.fetchAppointments();
    this.fetchPatients();
  }

  fetchAppointments() {
    this.appointmentService.getAppointments().subscribe((appts) => {
      this.appointments.set(appts);
    });
  }

  fetchPatients() {
    this.http
      .get<Patient[]>(`${environment.API_URL}/patients/`)
      .subscribe((patients) => {
        this.patients.set(patients);
      });
  }

  openAppointmentDetail(appt: Appointment) {
    this.selectedAppointment.set(appt);
    this.appointmentForm.reset({
      notes: '',
      diagnosis: '',
      treatment: '',
    });
    this.appointmentError.set(null);
    this.showAppointmentModal.set(true);
  }

  closeAppointmentModal() {
    this.showAppointmentModal.set(false);
    this.selectedAppointment.set(null);
  }

  submitAppointmentForm() {
    if (!this.selectedAppointment() || this.appointmentForm.invalid) return;
    this.appointmentLoading.set(true);
    this.appointmentError.set(null);
    const apptId = this.selectedAppointment()!.id;
    const payload = {
      patient_id: this.selectedAppointment()!.patient_id,
      appointment_id: apptId,
      notes: this.appointmentForm.value.notes,
      diagnosis: this.appointmentForm.value.diagnosis,
      treatment: this.appointmentForm.value.treatment,
      symptoms: this.appointmentForm.value.symptoms,
    };
    this.http
      .post(`${environment.API_URL}/appointments/${apptId}/complete`, payload)
      .subscribe({
        next: () => {
          this.appointmentLoading.set(false);
          this.showAppointmentModal.set(false);
          this.selectedAppointment.set(null);
          this.fetchAppointments();
        },
        error: (err) => {
          this.appointmentLoading.set(false);
          this.appointmentError.set(
            err?.error?.detail || 'Error al guardar la cita'
          );
        },
      });
  }

  openPatientHistory(patient: Patient) {
    this.selectedPatient.set(patient);
    this.patientHistoryLoading.set(true);
    this.patientHistoryError.set(null);
    this.patientMedicalRecords.set([]);
    this.showPatientHistory.set(true);
    this.http
      .get<any>(`${environment.API_URL}/patients/${patient.id}`)
      .subscribe({
        next: (profile) => {
          const recordIds = profile.medical_records || [];
          if (recordIds.length === 0) {
            this.patientMedicalRecords.set([]);
            this.patientHistoryLoading.set(false);
            return;
          }

          Promise.all(
            recordIds.map((id: number) =>
              firstValueFrom(
                this.http.get<MedicalRecord>(
                  `${environment.API_URL}/medical-records/${id}`
                )
              )
            )
          )
            .then((records) => {
              this.patientMedicalRecords.set(records);
              this.patientHistoryLoading.set(false);
            })
            .catch(() => {
              this.patientHistoryError.set('Error al cargar historial médico');
              this.patientHistoryLoading.set(false);
            });
        },
        error: () => {
          this.patientHistoryError.set('Error al cargar historial médico');
          this.patientHistoryLoading.set(false);
        },
      });
  }

  closePatientHistory() {
    this.showPatientHistory.set(false);
    this.selectedPatient.set(null);
    this.patientMedicalRecords.set([]);
    this.selectedMedicalRecord.set(null);
  }

  openMedicalRecordDetail(record: MedicalRecord) {
    this.selectedMedicalRecord.set(record);
  }

  closeMedicalRecordDetail() {
    this.selectedMedicalRecord.set(null);
  }
}
