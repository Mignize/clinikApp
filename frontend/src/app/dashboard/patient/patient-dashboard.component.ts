import { Component, OnInit, signal, computed } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  DatePipe,
  NgClass,
  TitleCasePipe,
  UpperCasePipe,
} from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { Appointment } from '../../types/appointment.type';
import { MedicalRecord } from '../../types/medical-record.type';
import { StatusLabelPipe } from '../../pipes/status-label.pipe';
import { DateFormatPipe } from '../../pipes/date-format.pipe';
import { AppointmentService } from '../../services/appointment.service';
import { AppButtonComponent } from '../../shared/app-button.component';
import { AppModalComponent } from '../../shared/app-modal.component';
import { AppCardComponent } from '../../shared/app-card.component';
import { AppBadgeComponent } from '../../shared/app-badge.component';
import { DoctorAvailability } from '../../types/doctor.type';

@Component({
  standalone: true,
  selector: 'app-patient-dashboard',
  templateUrl: './patient-dashboard.component.html',
  imports: [
    NgClass,
    TitleCasePipe,
    UpperCasePipe,
    DatePipe,
    ReactiveFormsModule,
    FormsModule,
    StatusLabelPipe,
    DateFormatPipe,
    AppButtonComponent,
    AppModalComponent,
    AppCardComponent,
    AppBadgeComponent,
  ],
  providers: [DatePipe],
})
export class PatientDashboardComponent implements OnInit {
  user;
  appointments = signal<Appointment[]>([]);
  medicalRecords = signal<MedicalRecord[]>([]);
  showScheduleModal = signal(false);
  scheduleForm: FormGroup;
  scheduleLoading = signal(false);
  scheduleError = signal<string | null>(null);
  doctorAvailability = signal<DoctorAvailability[]>([]);
  showAppointmentDetail = signal(false);
  selectedAppointment = signal<Appointment | null>(null);
  medicalRecord = signal<MedicalRecord | null>(null);
  medicalRecordLoading = signal(false);
  medicalRecordError = signal<string | null>(null);

  completedAppointments = computed(() =>
    this.appointments().filter((a) => a.status === 'completed')
  );
  cancelledAppointments = computed(() =>
    this.appointments().filter((a) => a.status === 'cancelled')
  );
  upcomingAppointments = computed(() => {
    const now = new Date();
    return this.appointments().filter(
      (a) =>
        (a.status === 'scheduled' ||
          a.status === 'agendado' ||
          a.status === 'pendiente') &&
        new Date(a.appointment_date) > now
    );
  });
  totalUpcomingAppointments = computed(
    () => this.upcomingAppointments().length
  );
  totalMedicalRecords = computed(() => this.medicalRecords().length);

  constructor(
    private auth: AuthService,
    private appointmentService: AppointmentService,
    private http: HttpClient,
    private fb: FormBuilder
  ) {
    this.user = toSignal(this.auth.user, { initialValue: null });
    this.scheduleForm = this.fb.group({
      doctor_id: [null, Validators.required],
      date: [null, Validators.required],
      reason: ['', [Validators.required, Validators.minLength(5)]],
    });
  }

  ngOnInit() {
    this.fetchAppointments();
    this.fetchMedicalRecords();
    this.fetchDoctorAvailability();
  }

  fetchAppointments() {
    this.appointmentService.getAppointments().subscribe((appts) => {
      this.appointments.set(appts);
    });
  }

  fetchMedicalRecords() {
    this.http
      .get<any>(`${environment.API_URL}/patients/${this.user()?.id}`)
      .subscribe((profile) => {
        this.medicalRecords.set(
          (profile.medical_records || []).map((id: number) => ({ id }))
        );
      });
  }

  fetchDoctorAvailability() {
    this.http
      .get<DoctorAvailability[]>(`${environment.API_URL}/availability/`)
      .subscribe((avail) => {
        this.doctorAvailability.set(avail);
      });
  }

  openScheduleModal() {
    this.scheduleForm.reset();
    this.scheduleError.set(null);
    this.showScheduleModal.set(true);
  }

  closeScheduleModal() {
    this.showScheduleModal.set(false);
  }

  submitSchedule() {
    if (this.scheduleForm.invalid) return;
    this.scheduleLoading.set(true);
    this.scheduleError.set(null);
    const payload = {
      patient_id: this.user()?.id,
      doctor_id: this.scheduleForm.value.doctor_id,
      appointment_date: this.scheduleForm.value.date,
      reason: this.scheduleForm.value.reason,
    };
    this.appointmentService.createAppointment(payload).subscribe({
      next: () => {
        this.scheduleLoading.set(false);
        this.closeScheduleModal();
        this.fetchAppointments();
      },
      error: (err) => {
        this.scheduleLoading.set(false);
        this.scheduleError.set(
          err?.error?.detail || 'Error al agendar la cita'
        );
      },
    });
  }

  async openAppointmentDetail(appt: Appointment) {
    this.selectedAppointment.set(appt);
    this.medicalRecord.set(null);
    this.medicalRecordError.set(null);
    if (appt.status === 'completed' || appt.status === 'completada') {
      this.medicalRecordLoading.set(true);
      try {
        const record = await firstValueFrom(
          this.http.get<MedicalRecord>(
            `${environment.API_URL}/medical-records/by-appointment/${appt.id}`
          )
        );
        this.medicalRecord.set(record);
        this.medicalRecordLoading.set(false);
      } catch (err: any) {
        this.medicalRecordError.set(
          err?.error?.detail || 'No hay registro médico para esta cita.'
        );
        this.medicalRecordLoading.set(false);
      }
    }
    this.showAppointmentDetail.set(true);
  }
  closeAppointmentDetail() {
    this.showAppointmentDetail.set(false);
    this.selectedAppointment.set(null);
  }
  cancelAppointment() {
    if (!this.selectedAppointment()) return;
    const apptId = String(this.selectedAppointment()!.id);
    this.scheduleLoading.set(true);
    this.appointmentService
      .updateAppointment(apptId, { status: 'cancelled' })
      .subscribe({
        next: () => {
          this.scheduleLoading.set(false);
          this.closeAppointmentDetail();
          this.fetchAppointments();
        },
        error: (err) => {
          this.scheduleLoading.set(false);
          this.scheduleError.set(
            err?.error?.detail || 'Error al cancelar la cita'
          );
        },
      });
  }

  get availableSlots(): string[] {
    const selectedId = this.scheduleForm.get('doctor_id')?.value;
    const doctor = this.doctorAvailability().find(
      (d) => d.doctor_id === Number(selectedId)
    );

    return doctor?.available_slots || [];
  }
}
