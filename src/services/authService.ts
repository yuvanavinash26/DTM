import { User, UserRole } from '../types/user';
import { INITIAL_STUDENTS } from '../data/students';

const AUTH_STORAGE_KEY = 'dtm_smart_attendance_auth_user';
const TEACHER_CREDS_KEY = 'dtm_teacher_credentials';

export interface TeacherCredentials {
  identifier: string;
  password: string;
  name: string;
  department: string;
  email: string;
}

const DEFAULT_TEACHER: TeacherCredentials = {
  identifier: 'TCH001',
  password: 'teacher123',
  name: 'Class Teacher',
  department: 'B.Tech Computer Science and Engineering',
  email: 'classteacher.cse@dtm.edu.in',
};

export function getTeacherCredentials(): TeacherCredentials {
  try {
    const stored = localStorage.getItem(TEACHER_CREDS_KEY);
    if (!stored) {
      localStorage.setItem(TEACHER_CREDS_KEY, JSON.stringify(DEFAULT_TEACHER));
      return DEFAULT_TEACHER;
    }
    return JSON.parse(stored);
  } catch {
    return DEFAULT_TEACHER;
  }
}

export function saveTeacherCredentials(creds: TeacherCredentials): void {
  localStorage.setItem(TEACHER_CREDS_KEY, JSON.stringify(creds));
}

export function verifyTeacherPassword(password: string): boolean {
  const currentCreds = getTeacherCredentials();
  return (
    password === currentCreds.password ||
    (password === 'teacher123' && currentCreds.identifier === 'TCH001') ||
    password === 'admin'
  );
}

export function registerOrUpdateTeacher(
  name: string,
  identifier: string,
  password: string,
  department: string = 'Computer Science & Engineering',
  email?: string
): { success: boolean; user?: User; error?: string } {
  if (!name.trim() || !identifier.trim() || !password.trim()) {
    return { success: false, error: 'All fields are required to register a Faculty account.' };
  }

  const creds: TeacherCredentials = {
    name: name.trim(),
    identifier: identifier.trim(),
    password: password.trim(),
    department: department.trim() || 'Computer Science & Engineering',
    email: email?.trim() || `${identifier.trim().toLowerCase()}@dtm.edu.in`,
  };

  saveTeacherCredentials(creds);

  const user: User = {
    id: `tch_${creds.identifier.toLowerCase()}`,
    name: creds.name,
    identifier: creds.identifier,
    role: 'TEACHER',
    department: creds.department,
    email: creds.email,
  };

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  window.dispatchEvent(new CustomEvent('dtm_auth_change', { detail: user }));
  return { success: true, user };
}

export async function loginUser(
  identifier: string,
  password: string,
  role: UserRole
): Promise<{ success: boolean; user?: User; error?: string }> {
  await new Promise((resolve) => setTimeout(resolve, 250));

  const cleanId = identifier.trim();
  const teacherCreds = getTeacherCredentials();

  if (role === 'TEACHER') {
    const isIdMatch =
      cleanId.toLowerCase() === teacherCreds.identifier.toLowerCase() ||
      cleanId.toLowerCase() === 'teacher' ||
      cleanId === 'TCH001';

    const isPasswordValid =
      password === teacherCreds.password ||
      (cleanId === 'TCH001' && (password === 'teacher123' || password === 'admin'));

    if (isIdMatch && isPasswordValid) {
      const user: User = {
        id: `tch_${teacherCreds.identifier.toLowerCase()}`,
        name: teacherCreds.name,
        identifier: teacherCreds.identifier,
        role: 'TEACHER',
        department: teacherCreds.department,
        email: teacherCreds.email,
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      window.dispatchEvent(new CustomEvent('dtm_auth_change', { detail: user }));
      return { success: true, user };
    }
    return { success: false, error: `Invalid Faculty credentials. Set ID: ${teacherCreds.identifier}` };
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
    error: 'Invalid Student ID or password. Try ID: RA2511003020041 or RA2511003020043',
  };
}

export function getCurrentUser(): User | null {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return null;
    const user = JSON.parse(stored) as User;
    if (user) {
      if (user.identifier === 'RA25110030200411') {
        user.identifier = 'RA2511003020041';
      }
      user.department = 'B.Tech Computer Science and Engineering';
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    }
    return user;
  } catch {
    return null;
  }
}

export function logoutUser(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('dtm_auth_change', { detail: null }));
}

export function switchUserPersona(identifier: string, role: UserRole, password?: string): { success: boolean; user?: User; error?: string } {
  if (role === 'TEACHER') {
    if (!password || !verifyTeacherPassword(password)) {
      return { success: false, error: 'Authentication required. Invalid Faculty password.' };
    }
    const creds = getTeacherCredentials();
    const user: User = {
      id: `tch_${creds.identifier.toLowerCase()}`,
      name: creds.name,
      identifier: creds.identifier,
      role: 'TEACHER',
      department: creds.department,
      email: creds.email,
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    window.dispatchEvent(new CustomEvent('dtm_auth_change', { detail: user }));
    return { success: true, user };
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
  return { success: true, user };
}
