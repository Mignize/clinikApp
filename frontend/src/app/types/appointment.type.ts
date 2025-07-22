export interface Appointment {
  id: number;
  appointment_date: string;
  doctor_id: number;
  patient_id: number;
  doctor_name?: string;
  patient_name?: string;
  status: string;
  reason?: string;
  notes?: string;
  diagnosis?: string;
  treatment?: string;
  symptoms?: string;
  summary?: string;
}
