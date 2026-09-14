export type UserRole = 'STUDENT' | 'TEACHER';

export interface User {
  id: string;
  name: string;
  identifier: string; // Student ID or Teacher ID
  role: UserRole;
  department?: string;
  email?: string;
  avatarUrl?: string;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: string;
}
