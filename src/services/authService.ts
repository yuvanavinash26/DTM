import { User, UserRole } from '../types/user';
import { INITIAL_STUDENTS } from '../data/students';

const AUTH_STORAGE_KEY = 'dtm_smart_attendance_auth_user';

export const TEACHER_PROFILE: User = {
  id: 'tch_01',
  name: 'Class Teacher',
  identifier: 'TCH001',
  role: 'TEACHER',
  department: 'Computer Science & Engineering',
  email: 'classteacher.cse@dtm.edu.in',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
};

export async function loginUser(
  identifier: string,
  password: string,
  role: UserRole
): Promise<{ success: boolean; user?: User; error?: string }> {
  // Simulate standard network delay
  await new Promise((resolve) => setTimeout(resolve, 250));

  const cleanId = identifier.trim();

  if (role === 'TEACHER') {
    if ((cleanId === 'TCH001' || cleanId.toLowerCase() === 'teacher') && (password === 'teacher123' || password === 'admin')) {
      const user = TEACHER_PROFILE;
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      window.dispatchEvent(new CustomEvent('dtm_auth_change', { detail: user }));
      return { success: true, user };
    }
    return { success: false, error: 'Invalid Teacher ID or credentials. Try ID: TCH001' };
  }

  // Student login
  const student = INITIAL_STUDENTS.find(
    (s) => s.studentId.toLowerCase() === cleanId.toLowerCase() || s.id === cleanId
  );

  if (student && (password === 'password123' || password === 'student123' || password === '123456')) {
    const user: User = {
      id: student.id,
      name: student.name,
      identifier: student.studentId,
      role: 'STUDENT',
      department: student.department,
      email: student.email,
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    window.dispatchEvent(new CustomEvent('dtm_auth_change', { detail: user }));
    return { success: true, user };
  }

  return {
    success: false,
    error: 'Invalid Student ID or password. Try ID: RA25110030200411 or RA2511003020043',
  };
}

export function getCurrentUser(): User | null {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as User;
  } catch {
    return null;
  }
}

export function logoutUser(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('dtm_auth_change', { detail: null }));
}

export function switchUserPersona(identifier: string, role: UserRole): User {
  if (role === 'TEACHER') {
    const user = TEACHER_PROFILE;
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    window.dispatchEvent(new CustomEvent('dtm_auth_change', { detail: user }));
    return user;
  }

  const student = INITIAL_STUDENTS.find(
    (s) => s.studentId.toLowerCase() === identifier.toLowerCase() || s.id === identifier
  ) || INITIAL_STUDENTS[0];

  const user: User = {
    id: student.id,
    name: student.name,
    identifier: student.studentId,
    role: 'STUDENT',
    department: student.department,
    email: student.email,
  };

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  window.dispatchEvent(new CustomEvent('dtm_auth_change', { detail: user }));
  return user;
}
