export interface User {
  id: number;
  email: string;
  full_name?: string;
  role: 'admin' | 'doctor' | 'patient';
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}
