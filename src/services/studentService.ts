import { Student } from '../types/student';
import { INITIAL_STUDENTS } from '../data/students';
import { getAttendanceRecordsInternal } from './attendanceService';

const STUDENTS_STORAGE_KEY = 'dtm_students_data';

export function initializeStudents(): Student[] {
  try {
    const stored = localStorage.getItem(STUDENTS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to parse stored students', e);
  }
  localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(INITIAL_STUDENTS));
  return INITIAL_STUDENTS;
}

export async function getAllStudents(): Promise<Student[]> {
  const students = initializeStudents();
  // Recalculate based on real attendance records
  const attendance = getAttendanceRecordsInternal();

  return students.map((std) => {
    const records = attendance.filter((r) => r.studentId === std.studentId);
    const present = records.filter((r) => r.finalStatus === 'PRESENT' || r.finalStatus === 'MANUALLY_MARKED').length;
    const absent = records.filter((r) => r.finalStatus === 'ABSENT').length;
    const total = present + absent;
    const pct = total > 0 ? Number(((present / total) * 100).toFixed(1)) : std.attendancePercentage;

    return {
      ...std,
      totalClasses: total > 0 ? total : std.totalClasses,
      presentClasses: total > 0 ? present : std.presentClasses,
      absentClasses: total > 0 ? absent : std.absentClasses,
      attendancePercentage: pct,
    };
  });
}

export async function getStudentById(studentId: string): Promise<Student | null> {
  const all = await getAllStudents();
  return all.find((s) => s.studentId === studentId || s.id === studentId) || null;
}

export async function getStudentByRfid(rfidUid: string): Promise<Student | null> {
  const all = await getAllStudents();
  return all.find((s) => s.rfidUid.toLowerCase() === rfidUid.toLowerCase()) || null;
}
