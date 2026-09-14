import {
  AttendanceRecord,
  AttendanceStats,
  WeeklyAttendancePoint,
  RfidStatus,
  BleStatus,
  FinalAttendanceStatus,
} from '../types/attendance';
import { INITIAL_ATTENDANCE_RECORDS } from '../data/attendance';
import { INITIAL_STUDENTS } from '../data/students';
import { recordDeviceScan } from './deviceService';
import { formatDate, formatShortTime } from '../utils/dateUtils';
import { computeFinalStatus, determineVerificationMethod } from '../utils/attendanceLogic';

export { fetchAttendanceStatus } from './flaskAttendanceService';

const ATTENDANCE_STORAGE_KEY = 'dtm_attendance_records';

export function getAttendanceRecordsInternal(): AttendanceRecord[] {
  try {
    const stored = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to read stored attendance', e);
  }
  localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(INITIAL_ATTENDANCE_RECORDS));
  return INITIAL_ATTENDANCE_RECORDS;
}

export function saveAttendanceRecords(records: AttendanceRecord[]) {
  localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(records));
  // Dispatch custom event for current window
  window.dispatchEvent(new CustomEvent('dtm_attendance_update', { detail: records }));
}

export async function getAttendance(filterDate?: string): Promise<AttendanceRecord[]> {
  const records = getAttendanceRecordsInternal();
  if (filterDate) {
    return records.filter((r) => r.date === filterDate);
  }
  return records;
}

export async function getStudentAttendance(studentId: string): Promise<AttendanceRecord[]> {
  const records = getAttendanceRecordsInternal();
  return records.filter((r) => r.studentId === studentId);
}

export async function getTodayAttendance(): Promise<AttendanceRecord[]> {
  const records = getAttendanceRecordsInternal();
  const todayStr = '2026-09-14'; // Standardized session date
  return records.filter((r) => r.date === todayStr);
}

/**
 * Simulates or handles future incoming ESP32 RFID scan POST /api/attendance/rfid
 */
export async function recordRFIDScan(
  rfidUid: string,
  deviceId: string = 'DTM-ESP32-01',
  timestamp?: string
): Promise<{ success: boolean; record?: AttendanceRecord; message: string }> {
  const cleanUid = rfidUid.trim().toUpperCase();
  const student = INITIAL_STUDENTS.find(
    (s) => s.rfidUid.toUpperCase() === cleanUid
  );

  if (!student) {
    return {
      success: false,
      message: `Unknown RFID Tag: ${cleanUid}. Student not registered in system.`,
    };
  }

  const now = new Date();
  const dateStr = '2026-09-14';
  const timeStr = formatShortTime(now);
  const isoTimestamp = timestamp || `${dateStr}T${now.toTimeString().split(' ')[0]}+05:30`;

  const records = getAttendanceRecordsInternal();
  const existingIndex = records.findIndex(
    (r) => r.date === dateStr && r.studentId === student.studentId
  );

  let updatedRecord: AttendanceRecord;

  if (existingIndex >= 0) {
    const existing = records[existingIndex];
    const newRfid: RfidStatus = 'VERIFIED';
    const newBle: BleStatus = 'PENDING';
    const finalStat = computeFinalStatus(newRfid, newBle, false);

    updatedRecord = {
      ...existing,
      time: timeStr,
      timestamp: isoTimestamp,
      rfidStatus: newRfid,
      bleStatus: newBle,
      finalStatus: finalStat,
      verificationMethod: determineVerificationMethod(newRfid, newBle, false),
      manualOverride: false,
      deviceId,
    };
    records[existingIndex] = updatedRecord;
  } else {
    updatedRecord = {
      attendanceId: `att_${Date.now()}`,
      studentId: student.studentId,
      studentName: student.name,
      rfidUid: cleanUid,
      date: dateStr,
      time: timeStr,
      timestamp: isoTimestamp,
      subject: 'Digital Technology & Management',
      rfidStatus: 'VERIFIED',
      bleStatus: 'PENDING',
      finalStatus: 'PENDING',
      verificationMethod: 'RFID_ONLY',
      manualOverride: false,
      deviceId,
      rssi: -50,
    };
    records.unshift(updatedRecord);
  }

  saveAttendanceRecords(records);
  recordDeviceScan(cleanUid, student.name, -48);

  // Broadcast toast event
  window.dispatchEvent(
    new CustomEvent('dtm_toast_event', {
      detail: {
        type: 'rfid_scan',
        title: 'RFID Card Scanned',
        studentName: student.name,
        studentId: student.studentId,
        statusText: 'RFID ✓ | BLE Pending...',
        variant: 'amber',
      },
    })
  );

  return { success: true, record: updatedRecord, message: 'RFID scan registered' };
}

/**
 * Simulates or handles future incoming ESP32/Phone BLE verification POST /api/attendance/ble
 */
export async function recordBLEVerification(
  studentId: string,
  verified: boolean,
  rssi: number = -48,
  timestamp?: string
): Promise<{ success: boolean; record?: AttendanceRecord; message: string }> {
  const records = getAttendanceRecordsInternal();
  const dateStr = '2026-09-14';
  const index = records.findIndex(
    (r) => r.date === dateStr && r.studentId === studentId
  );

  if (index < 0) {
    return {
      success: false,
      message: 'No active attendance session found for today. Scan RFID first.',
    };
  }

  const existing = records[index];
  const newBleStatus: BleStatus = verified ? 'VERIFIED' : 'FAILED';
  const finalStat: FinalAttendanceStatus = computeFinalStatus(
    existing.rfidStatus,
    newBleStatus,
    false
  );

  const updatedRecord: AttendanceRecord = {
    ...existing,
    bleStatus: newBleStatus,
    finalStatus: finalStat,
    rssi,
    verificationMethod: determineVerificationMethod(existing.rfidStatus, newBleStatus, false),
  };

  records[index] = updatedRecord;
  saveAttendanceRecords(records);
  recordDeviceScan(existing.rfidUid, existing.studentName, rssi);

  if (verified) {
    window.dispatchEvent(
      new CustomEvent('dtm_toast_event', {
        detail: {
          type: 'ble_verified',
          title: 'Attendance Verified',
          studentName: existing.studentName,
          studentId: existing.studentId,
          statusText: 'RFID ✓ | BLE ✓ | PRESENT',
          variant: 'emerald',
        },
      })
    );
  } else {
    window.dispatchEvent(
      new CustomEvent('dtm_toast_event', {
        detail: {
          type: 'ble_failed',
          title: 'Verification Required',
          studentName: existing.studentName,
          studentId: existing.studentId,
          statusText: 'RFID ✓ | BLE ✕ | Teacher action required',
          variant: 'rose',
        },
      })
    );
  }

  return { success: true, record: updatedRecord, message: 'BLE verification processed' };
}

/**
 * Teacher manual attendance override modal confirmation
 */
export async function markManualAttendance(
  studentId: string,
  status: 'PRESENT' | 'ABSENT',
  reason: string,
  note?: string,
  teacherId: string = 'TCH001',
  teacherName: string = 'Class Teacher'
): Promise<{ success: boolean; record?: AttendanceRecord }> {
  const records = getAttendanceRecordsInternal();
  const dateStr = '2026-09-14';
  const student = INITIAL_STUDENTS.find((s) => s.studentId === studentId);

  if (!student) {
    return { success: false };
  }

  const index = records.findIndex(
    (r) => r.date === dateStr && r.studentId === studentId
  );

  const now = new Date();
  const timeStr = formatShortTime(now);
  const iso = `${dateStr}T${now.toTimeString().split(' ')[0]}+05:30`;

  let updatedRecord: AttendanceRecord;

  if (index >= 0) {
    const existing = records[index];
    updatedRecord = {
      ...existing,
      finalStatus: status === 'PRESENT' ? 'MANUALLY_MARKED' : 'ABSENT',
      manualOverride: true,
      verificationMethod: 'MANUAL',
      teacherId,
      teacherName,
      reason,
      note: note || '',
      time: existing.time !== '—' ? existing.time : timeStr,
    };
    records[index] = updatedRecord;
  } else {
    updatedRecord = {
      attendanceId: `att_${Date.now()}`,
      studentId: student.studentId,
      studentName: student.name,
      rfidUid: student.rfidUid,
      date: dateStr,
      time: timeStr,
      timestamp: iso,
      subject: 'Digital Technology & Management',
      rfidStatus: 'NOT_DETECTED',
      bleStatus: 'NOT_DETECTED',
      finalStatus: status === 'PRESENT' ? 'MANUALLY_MARKED' : 'ABSENT',
      verificationMethod: 'MANUAL',
      manualOverride: true,
      teacherId,
      teacherName,
      reason,
      note: note || '',
      deviceId: 'DTM-ESP32-01',
    };
    records.unshift(updatedRecord);
  }

  saveAttendanceRecords(records);

  window.dispatchEvent(
    new CustomEvent('dtm_toast_event', {
      detail: {
        type: 'manual_override',
        title: 'Attendance Updated',
        studentName: student.name,
        studentId: student.studentId,
        statusText: `Manually verified by ${teacherName} (${status})`,
        variant: 'purple',
      },
    })
  );

  return { success: true, record: updatedRecord };
}

/**
 * Resets today's verification back to initial session state for smooth evaluation
 */
export async function resetTodaysVerification(): Promise<void> {
  const records = getAttendanceRecordsInternal();
  const dateStr = '2026-09-14';

  const nonToday = records.filter((r) => r.date !== dateStr);
  const initialToday = INITIAL_ATTENDANCE_RECORDS.filter((r) => r.date === dateStr);

  const resetRecords = [...initialToday, ...nonToday];
  saveAttendanceRecords(resetRecords);

  window.dispatchEvent(
    new CustomEvent('dtm_toast_event', {
      detail: {
        type: 'reset',
        title: 'Session Synchronized',
        studentName: 'Classroom C-304',
        statusText: 'Verification state returned to live session baseline',
        variant: 'blue',
      },
    })
  );
}

/**
 * Aggregate stats calculation
 */
export async function getAttendanceStatistics(): Promise<AttendanceStats> {
  const records = getAttendanceRecordsInternal();
  const dateStr = '2026-09-14';
  const todayRecords = records.filter((r) => r.date === dateStr);

  const totalStudents = INITIAL_STUDENTS.length;
  const presentToday = todayRecords.filter(
    (r) => r.finalStatus === 'PRESENT' || r.finalStatus === 'MANUALLY_MARKED'
  ).length;
  const absentToday = todayRecords.filter((r) => r.finalStatus === 'ABSENT').length;
  const pendingToday = todayRecords.filter((r) => r.finalStatus === 'PENDING').length;

  const rfidVerifiedCount = todayRecords.filter((r) => r.rfidStatus === 'VERIFIED').length;
  const bleVerifiedCount = todayRecords.filter((r) => r.bleStatus === 'VERIFIED').length;
  const manualOverrideCount = todayRecords.filter((r) => r.manualOverride).length;

  const rfidFailuresCount = todayRecords.filter((r) => r.rfidStatus === 'FAILED').length;
  const bleFailuresCount = todayRecords.filter((r) => r.bleStatus === 'FAILED').length;

  const evaluated = presentToday + absentToday;
  const rate = evaluated > 0 ? Number(((presentToday / totalStudents) * 100).toFixed(0)) : 100;

  return {
    totalStudents,
    presentToday,
    absentToday,
    pendingToday,
    attendanceRate: rate,
    rfidVerifiedCount,
    bleVerifiedCount,
    manualOverrideCount,
    rfidFailuresCount,
    bleFailuresCount,
  };
}

export async function getWeeklyAttendance(): Promise<WeeklyAttendancePoint[]> {
  return [
    { day: 'Monday', date: '08 Sep', presentCount: 1, absentCount: 1, rate: 50 },
    { day: 'Tuesday', date: '09 Sep', presentCount: 2, absentCount: 0, rate: 100 },
    { day: 'Wednesday', date: '10 Sep', presentCount: 1, absentCount: 1, rate: 50 },
    { day: 'Thursday', date: '11 Sep', presentCount: 2, absentCount: 0, rate: 100 },
    { day: 'Friday', date: '12 Sep', presentCount: 2, absentCount: 0, rate: 100 },
  ];
}

export function exportAttendanceCSV(): void {
  const records = getAttendanceRecordsInternal();
  const headers = [
    'Attendance ID',
    'Date',
    'Time',
    'Student ID',
    'Student Name',
    'Subject',
    'RFID UID',
    'RFID Status',
    'BLE Status',
    'Final Status',
    'Verification Method',
    'Manual Override',
    'Verified By',
    'Reason/Note',
  ];

  const rows = records.map((r) => [
    r.attendanceId,
    r.date,
    r.time,
    r.studentId,
    `"${r.studentName}"`,
    `"${r.subject}"`,
    r.rfidUid,
    r.rfidStatus,
    r.bleStatus,
    r.finalStatus,
    r.verificationMethod,
    r.manualOverride ? 'YES' : 'NO',
    `"${r.teacherName || 'System'}"`,
    `"${(r.reason || '') + (r.note ? ' - ' + r.note : '')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `DTM_Attendance_Report_${formatDate(new Date())}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function resetAllDataToDefault(): void {
  localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(INITIAL_ATTENDANCE_RECORDS));
  localStorage.removeItem('dtm_esp32_device_state');
  window.dispatchEvent(new CustomEvent('dtm_attendance_update', { detail: INITIAL_ATTENDANCE_RECORDS }));
  window.dispatchEvent(new CustomEvent('dtm_device_update', {}));
}
