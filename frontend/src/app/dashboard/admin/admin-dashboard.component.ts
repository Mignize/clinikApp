import { Component, OnInit, computed, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { DatePipe, NgClass, TitleCasePipe } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Appointment } from '../../types/appointment.type';
import { User } from '../../types/user.type';
import { Clinic } from '../../types/clinic.type';
import { StatusLabelPipe } from '../../pipes/status-label.pipe';
import { DateFormatPipe } from '../../pipes/date-format.pipe';
import { AppointmentService } from '../../services/appointment.service';
import { AppButtonComponent } from '../../shared/app-button.component';
import { AppModalComponent } from '../../shared/app-modal.component';
import { AppCardComponent } from '../../shared/app-card.component';
import { AppBadgeComponent } from '../../shared/app-badge.component';

@Component({
  standalone: true,
  selector: 'app-admin-dashboard',
  imports: [
    TitleCasePipe,
    NgClass,
    DatePipe,
    FormsModule,
    ReactiveFormsModule,
    StatusLabelPipe,
    DateFormatPipe,
    AppButtonComponent,
    AppModalComponent,
    AppCardComponent,
    AppBadgeComponent,
  ],
  providers: [DatePipe],
  templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent implements OnInit {
  users = signal<User[]>([]);
  appointments = signal<Appointment[]>([]);
  clinics = signal<Clinic[]>([]);
  selectedRole = signal('');
  search = signal('');
  loading = signal(true);

  totalUsers = computed(() => this.users().length);
  totalDoctors = computed(
    () => this.users().filter((u) => u.role === 'doctor').length
  );
  totalPatients = computed(
    () => this.users().filter((u) => u.role === 'patient').length
  );
  totalAdmins = computed(
    () => this.users().filter((u) => u.role === 'admin').length
  );
  totalAppointments = computed(() => this.appointments().length);

  filteredUsers = computed(() => {
    let list = this.users();
    const role = this.selectedRole();
    const search = this.search().toLowerCase();
    if (role) {
      list = list.filter((u) => u.role === role);
    }
    if (search) {
      list = list.filter(
        (u) =>
          (u.full_name || '').toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search)
      );
    }
    return list;
  });

  showAddUser = signal(false);
  addUserForm: FormGroup;
  addUserLoading = signal(false);
  addUserError = signal<string | null>(null);

  showUserModal = signal(false);
  selectedUser = signal<User | null>(null);
  userEditForm: FormGroup;
  userEditLoading = signal(false);
  userEditError = signal<string | null>(null);

  appointmentsLimit = signal(5);
  appointmentsOffset = signal(0);
  totalAppointmentsCount = signal(0);

  constructor(
    private appointmentService: AppointmentService,
    private http: HttpClient,
    private fb: FormBuilder
  ) {
    effect(() => {
      this.fetchUsers(this.selectedRole());
    });
    this.addUserForm = this.fb.group({
      full_name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['doctor', [Validators.required]],
    });
    this.userEditForm = this.fb.group({
      full_name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      is_active: [true],
      is_verified: [false],
      role: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    this.fetchUsers(this.selectedRole());
    this.fetchAppointments();
    this.fetchClinics();
  }

  fetchUsers(role?: string) {
    this.loading.set(true);
    if (role) {
      this.http
        .get<User[]>(`${environment.API_URL}/user/role/${role}`)
        .subscribe((users) => {
          this.users.set(users);
          this.loading.set(false);
        });
    } else {
      this.http
        .get<User[]>(`${environment.API_URL}/user/`)
        .subscribe((users) => {
          this.users.set(users);
          this.loading.set(false);
        });
    }
  }

  fetchAppointments() {
    const limit = this.appointmentsLimit();
    const offset = this.appointmentsOffset();
    this.appointmentService
      .getAppointments({ limit, offset })
      .subscribe((appointments) => {
        this.appointments.set(appointments);
        if (appointments.length === limit) {
          this.totalAppointmentsCount.set(offset + appointments.length + 1);
        } else {
          this.totalAppointmentsCount.set(offset + appointments.length);
        }
      });
  }

  nextAppointmentsPage() {
    this.appointmentsOffset.set(
      this.appointmentsOffset() + this.appointmentsLimit()
    );
    this.fetchAppointments();
  }
  prevAppointmentsPage() {
    this.appointmentsOffset.set(
      Math.max(0, this.appointmentsOffset() - this.appointmentsLimit())
    );
    this.fetchAppointments();
  }

  fetchClinics() {
    this.http
      .get<Clinic[]>(`${environment.API_URL}/clinics/`)
      .subscribe((clinics) => {
        this.clinics.set(clinics);
      });
  }

  onRoleChange(role: string) {
    this.selectedRole.set(role);
  }

  openAddUser() {
    this.showAddUser.set(true);
    this.addUserForm.reset({ role: 'doctor' });
    this.addUserError.set(null);
  }

  closeAddUser() {
    this.showAddUser.set(false);
  }

  submitAddUser() {
    if (this.addUserForm.invalid) return;
    this.addUserLoading.set(true);
    this.addUserError.set(null);
    this.http
      .post(
        `${environment.API_URL}/user/create-admin-or-doctor`,
        this.addUserForm.value
      )
      .subscribe({
        next: () => {
          this.addUserLoading.set(false);
          this.showAddUser.set(false);
          this.fetchUsers(this.selectedRole());
          this.addUserForm.reset({ role: 'doctor' });
        },
        error: (err) => {
          this.addUserLoading.set(false);
          this.addUserError.set(err.error?.detail || 'Error al crear usuario');
        },
      });
  }

  openUserModal(user: User) {
    this.selectedUser.set(user);
    this.userEditForm.reset({
      full_name: user.full_name,
      email: user.email,
      is_active: user.is_active,
      is_verified: user.is_verified,
      role: user.role,
    });
    this.userEditError.set(null);
    this.showUserModal.set(true);
  }

  closeUserModal() {
    this.showUserModal.set(false);
    this.selectedUser.set(null);
  }

  submitUserEdit() {
    if (!this.selectedUser() || this.userEditForm.invalid) return;
    this.userEditLoading.set(true);
    this.userEditError.set(null);
    this.http
      .patch(
        `${environment.API_URL}/user/${this.selectedUser()!.id}`,
        this.userEditForm.value
      )
      .subscribe({
        next: () => {
          this.userEditLoading.set(false);
          this.showUserModal.set(false);
          this.fetchUsers(this.selectedRole());
        },
        error: (err) => {
          this.userEditLoading.set(false);
          this.userEditError.set(
            err.error?.detail || 'Error al actualizar usuario'
          );
        },
      });
  }

  downloadAppointmentsCSV() {
    this.appointmentService
      .getAppointments({ limit: 1000, offset: 0 })
      .subscribe((appointments) => {
        if (!appointments.length) return;
        const headers = [
          'ID',
          'Fecha',
          'Hora',
          'Doctor',
          'Paciente',
          'Estado',
          'Motivo',
        ];
        const escape = (val: any) => {
          const s = String(val ?? '');
          return /[";\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
        };
        const rows = appointments.map((a) => [
          escape(a.id),
          escape(a.appointment_date?.split('T')[0] || ''),
          escape(a.appointment_date?.split('T')[1]?.slice(0, 5) || ''),
          escape(a.doctor_name || a.doctor_id),
          escape(a.patient_name || a.patient_id),
          escape(a.status),
          escape(a.reason || ''),
        ]);
        const csv = [headers, ...rows].map((r) => r.join(';')).join('\r\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'citas.csv';
        a.click();
        window.URL.revokeObjectURL(url);
      });
  }
}
