export interface MedicalRecord {
  id: number;
  diagnosis?: string;
  notes?: string;
  treatment?: string;
  symptoms?: string;
  summary?: string;
  doctor_id: number;
  date: string;
  created_at: string;
}
