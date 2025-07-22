import { jwtDecode } from 'jwt-decode';

export interface JwtPayload {
  user_id: number;
  role?: string;
  exp?: number;
  [key: string]: any;
}

export function decodeToken(token: string): JwtPayload | null {
  try {
    return jwtDecode<JwtPayload>(token);
  } catch {
    return null;
  }
}
