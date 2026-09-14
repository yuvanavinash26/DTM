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
import { getCurrentClass, isAttendanceActive } from './timetableService';
import { formatDate, formatShortTime } from '../utils/dateUtils';
import {
  computeFinalStatus,
  determineVerificationMethod,
  dispatchAttendanceToast,
} from '../utils/attendanceLogic';

export { fetchAttendanceStatus } from './flaskAttendanceService';

const ATTENDANCE_STORAGE_KEY = 'dtm_attendance_records';

export function getAttendanceRecordsInternal(): AttendanceRecord[] {
  try {
    const stored = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
    if (stored) {
      const parsed: AttendanceRecord[] = JSON.parse(stored);
      let changed = false;
      const updated = parsed.map((r) => {
        if (r.studentId === 'RA25110030200411') {
          changed = true;
          return { ...r, studentId: 'RA2511003020041' };
        }
        return r;
      });
      if (changed) {
        localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(updated));
      }
      return updated;
    }
  } catch (e) {
    console.error('Failed to read stored attendance', e);
  }
  localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(INITIAL_ATTENDANCE_RECORDS));
  return INITIAL_ATTENDANCE_RECORDS;
}

export function saveAttendanceRecords(records: AttendanceRecord[]) {
  localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(records));
  // Dispatch custom event for cross-component and cross-tab reactive synchronization
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
 * Handles RFID tap verification.
 * Strictly verifies that the current timetable status is ATTENDANCE ACTIVE.
 * If break, lunch, or no class: refuses attendance and notifies teacher.
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
    dispatchAttendanceToast({
      title: 'Unknown RFID Card',
      statusText: `UID: ${cleanUid} not registered`,
      variant: 'rose',
    });
    return {
      success: false,
      message: `Unknown RFID Tag: ${cleanUid}. Student not registered in system.`,
    };
  }

  // Check timetable status
  const currentClass = getCurrentClass();
  if (currentClass.attendanceMode !== 'ACTIVE') {
    dispatchAttendanceToast({
      title: 'Attendance Inactive',
      studentName: student.name,
      studentId: student.studentId,
      statusText: currentClass.statusMessage,
      variant: 'amber',
    });
    return {
      success: false,
      message: `Attendance is currently inactive (${currentClass.statusMessage}). Scans are only recorded during scheduled class periods.`,
    };
  }

  const now = new Date();
  const dateStr = '2026-09-14';
  const timeStr = formatShortTime(now);
  const isoTimestamp = timestamp || `${dateStr}T${now.toTimeString().split(' ')[0]}+05:30`;

  const records = getAttendanceRecordsInternal();
  const periodNum = currentClass.currentPeriod || 7;

  // Find record for this student for today AND this specific period (period-based attendance)
  const existingIndex = records.findIndex(
    (r) => r.date === dateStr && r.period === periodNum && r.studentId === student.studentId
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
      entryTime: timeStr,
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
      id: `att_${Date.now()}_${student.studentId}`,
      attendanceId: `att_${Date.now()}_${student.studentId}`,
      studentId: student.studentId,
      studentName: student.name,
      rfidUid: cleanUid,
      date: dateStr,
      day: currentClass.currentDay,
      period: periodNum,
      subject: currentClass.currentSubject,
      subjectCode: currentClass.subjectCode,
      scheduledStart: currentClass.startTime,
      scheduledEnd: currentClass.endTime,
      time: timeStr,
      entryTime: timeStr,
      timestamp: isoTimestamp,
      rfidStatus: 'VERIFIED',
      bleStatus: 'PENDING',
      finalStatus: 'PENDING',
      verificationMethod: 'RFID_ONLY',
      manualOverride: false,
      deviceId,
      rssi: -48,
    };
    records.unshift(updatedRecord);
  }

  saveAttendanceRecords(records);
  recordDeviceScan(cleanUid, student.name, -48);

  // Exact toast required by prompt:
  // "RFID Verified \n Yuvan Avinash \n RA2511003020041 \n BLE verification pending."
  dispatchAttendanceToast({
    title: 'RFID Verified',
    studentName: student.name,
    studentId: student.studentId,
    statusText: 'BLE verification pending...',
    variant: 'amber',
  });

  return { success: true, record: updatedRecord, message: 'RFID scan registered' };
}

/**
 * Handles Bluetooth BLE verification for the active student session
 */
export async function recordBLEVerification(
  studentId: string,
  verified: boolean,
  rssi: number = -48,
  timestamp?: string
): Promise<{ success: boolean; record?: AttendanceRecord; message: string }> {
  const records = getAttendanceRecordsInternal();
  const dateStr = '2026-09-14';
  const currentClass = getCurrentClass();
  const periodNum = currentClass.currentPeriod || 7;

  // Match current period or today's latest record
  let index = records.findIndex(
    (r) => r.date === dateStr && r.period === periodNum && r.studentId === studentId
  );
  if (index < 0) {
    index = records.findIndex(
      (r) => r.date === dateStr && r.studentId === studentId
    );
  }

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

  const now = new Date();
  const updatedRecord: AttendanceRecord = {
    ...existing,
    bleStatus: newBleStatus,
    finalStatus: finalStat,
    rssi,
    verificationTime: formatShortTime(now),
    verificationMethod: determineVerificationMethod(existing.rfidStatus, newBleStatus, false),
  };

  records[index] = updatedRecord;
  saveAttendanceRecords(records);
  recordDeviceScan(existing.rfidUid, existing.studentName, rssi);

  if (verified) {
    // Exact prompt required toast:
    // "Attendance Verified \n Yuvan Avinash \n RFID ✓ \n BLE ✓ \n PRESENT"
    dispatchAttendanceToast({
      title: 'Attendance Verified',
      studentName: existing.studentName,
      studentId: existing.studentId,
      statusText: 'RFID ✓  BLE ✓  PRESENT',
      variant: 'emerald',
    });
  } else {
    // Exact prompt required toast:
    // "Verification Required \n Yuvan Avinash \n RFID ✓ \n BLE ✕ \n Teacher review required."
    dispatchAttendanceToast({
      title: 'Verification Required',
      studentName: existing.studentName,
      studentId: existing.studentId,
      statusText: 'RFID ✓  BLE ✕  Teacher review required',
      variant: 'rose',
    });
  }

  return { success: true, record: updatedRecord, message: 'BLE verification processed' };
}

/**
 * Handles 30-Second BLE Out-of-Range Expiry
 */
export async function recordBLEExit(
  studentId: string,
  exitReason: string = 'BLE_OUT_OF_RANGE_30_SECONDS'
): Promise<{ success: boolean; record?: AttendanceRecord; message: string }> {
  const records = getAttendanceRecordsInternal();
  const dateStr = '2026-09-14';

  const index = records.findIndex(
    (r) => r.date === dateStr && r.studentId === studentId
  );

  if (index < 0) {
    return { success: false, message: 'No record found' };
  }

  const existing = records[index];
  const now = new Date();
  const exitTime = formatShortTime(now);

  const updatedRecord: AttendanceRecord = {
    ...existing,
    bleStatus: 'FAILED',
    finalStatus: 'PENDING',
    exitTime,
    exitReason,
    verificationMethod: 'RFID_ONLY',
  };

  records[index] = updatedRecord;
  saveAttendanceRecords(records);

  dispatchAttendanceToast({
    title: 'Verification Required',
    studentName: existing.studentName,
    studentId: existing.studentId,
    statusText: 'BLE 30s Expiry Reached (Exit Confirmed)',
    variant: 'rose',
  });

  return { success: true, record: updatedRecord, message: 'BLE exit recorded' };
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
): Promise<{ success: boolean; record?: AttendanceRecord; message: string }> {
  const records = getAttendanceRecordsInternal();
  const dateStr = '2026-09-14';

  let index = records.findIndex(
    (r) => r.date === dateStr && r.studentId === studentId
  );

  const student = INITIAL_STUDENTS.find((s) => s.studentId === studentId);
  const now = new Date();
  const timeStr = formatShortTime(now);

  let updatedRecord: AttendanceRecord;

  if (index >= 0) {
    const existing = records[index];
    updatedRecord = {
      ...existing,
      manualOverride: true,
      finalStatus: status === 'PRESENT' ? 'MANUALLY_MARKED' : 'ABSENT',
      teacherId,
      teacherName,
      reason,
      note: note || 'Manually confirmed by faculty',
      verificationMethod: 'MANUAL',
    };
    records[index] = updatedRecord;
  } else {
    // If no RFID record exists yet for today
    const currentClass = getCurrentClass();
    updatedRecord = {
      id: `att_manual_${Date.now()}`,
      attendanceId: `att_manual_${Date.now()}`,
      studentId,
      studentName: student ? student.name : studentId,
      rfidUid: student ? student.rfidUid : 'MANUAL',
      date: dateStr,
      day: currentClass.currentDay,
      period: currentClass.currentPeriod || 7,
      subject: currentClass.currentSubject,
      subjectCode: currentClass.subjectCode,
      time: timeStr,
      timestamp: `${dateStr}T${now.toTimeString().split(' ')[0]}+05:30`,
      rfidStatus: 'NOT_DETECTED',
      bleStatus: 'NOT_DETECTED',
      finalStatus: status === 'PRESENT' ? 'MANUALLY_MARKED' : 'ABSENT',
      verificationMethod: 'MANUAL',
      manualOverride: true,
      teacherId,
      teacherName,
      reason,
      note: note || 'Manually confirmed by faculty',
      deviceId: 'MANUAL_PORTAL',
    };
    records.unshift(updatedRecord);
  }

  saveAttendanceRecords(records);

  // Exact prompt required toast:
  // "Attendance Updated \n Manually verified by Class Teacher"
  dispatchAttendanceToast({
    title: 'Attendance Updated',
    studentName: student?.name,
    studentId,
    statusText: 'Manually verified by Class Teacher',
    variant: 'purple',
  });

  return { success: true, record: updatedRecord, message: 'Manual override applied successfully' };
}

/**
 * Calculates real aggregate attendance statistics from records
 */
export async function getAttendanceStatistics(filterDate?: string): Promise<AttendanceStats> {
  const records = await getAttendance(filterDate || '2026-09-14');
  const totalStudents = INITIAL_STUDENTS.length;

  const presentCount = records.filter(
    (r) => r.finalStatus === 'PRESENT' || r.finalStatus === 'MANUALLY_MARKED'
  ).length;

  const absentCount = records.filter((r) => r.finalStatus === 'ABSENT').length;
  const pendingCount = records.filter((r) => r.finalStatus === 'PENDING').length;

  const rfidVerified = records.filter((r) => r.rfidStatus === 'VERIFIED').length;
  const bleVerified = records.filter((r) => r.bleStatus === 'VERIFIED' || r.bleStatus === 'PRESENT').length;
  const manualOverrides = records.filter((r) => r.manualOverride).length;

  const rfidFailures = records.filter((r) => r.rfidStatus === 'FAILED').length;
  const bleFailures = records.filter((r) => r.bleStatus === 'FAILED' || r.bleStatus === 'ABSENT').length;

  const denominator = presentCount + absentCount;
  const rate = denominator > 0 ? Number(((presentCount / denominator) * 100).toFixed(1)) : 100;

  return {
    totalStudents,
    presentToday: presentCount,
    absentToday: absentCount,
    pendingToday: pendingCount,
    attendanceRate: rate,
    rfidVerifiedCount: rfidVerified,
    bleVerifiedCount: bleVerified,
    manualOverrideCount: manualOverrides,
    rfidFailuresCount: rfidFailures,
    bleFailuresCount: bleFailures,
  };
}

export async function getWeeklyTrends(): Promise<WeeklyAttendancePoint[]> {
  return [
    { day: 'Monday', date: '08 Sep', presentCount: 2, absentCount: 0, rate: 100.0 },
    { day: 'Tuesday', date: '09 Sep', presentCount: 2, absentCount: 0, rate: 100.0 },
    { day: 'Wednesday', date: '10 Sep', presentCount: 1, absentCount: 1, rate: 50.0 },
    { day: 'Thursday', date: '11 Sep', presentCount: 2, absentCount: 0, rate: 100.0 },
    { day: 'Friday', date: '12 Sep', presentCount: 2, absentCount: 0, rate: 100.0 },
  ];
}

/**
 * Generates and downloads a real CSV file using active application data
 */
export function exportAttendanceCSV(): void {
  const records = getAttendanceRecordsInternal();
  const headers = [
    'Student ID',
    'Student Name',
    'Date',
    'Day',
    'Period',
    'Subject',
    'Subject Code',
    'RFID UID',
    'RFID Status',
    'BLE Status',
    'Final Status',
    'Verification Method',
    'Entry Time',
    'RSSI (dBm)',
    'Manual Override',
    'Teacher ID',
    'Teacher Reason',
    'Teacher Note',
  ];

  const csvRows = [headers.join(',')];

  for (const r of records) {
    const row = [
      `"${r.studentId}"`,
      `"${r.studentName}"`,
      `"${r.date}"`,
      `"${r.day || 'Monday'}"`,
      `"P${r.period}"`,
      `"${r.subject.replace(/"/g, '""')}"`,
      `"${r.subjectCode}"`,
      `"${r.rfidUid}"`,
      `"${r.rfidStatus}"`,
      `"${r.bleStatus}"`,
      `"${r.finalStatus}"`,
      `"${r.verificationMethod || 'RFID_BLE'}"`,
      `"${r.entryTime || r.time || '—'}"`,
      `"${r.rssi !== undefined ? r.rssi : 'N/A'}"`,
      `"${r.manualOverride ? 'YES' : 'NO'}"`,
      `"${r.teacherId || ''}"`,
      `"${(r.reason || '').replace(/"/g, '""')}"`,
      `"${(r.note || '').replace(/"/g, '""')}"`,
    ];
    csvRows.push(row.join(','));
  }

  const csvString = csvRows.join('\r\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `DTM_Attendance_Report_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  dispatchAttendanceToast({
    title: 'Report Exported',
    statusText: `${records.length} records exported to CSV successfully`,
    variant: 'emerald',
  });
}

/**
 * Resets attendance data back to default authoritative baseline
 */
export function resetAllDataToDefault(): void {
  localStorage.removeItem(ATTENDANCE_STORAGE_KEY);
  localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(INITIAL_ATTENDANCE_RECORDS));
  window.dispatchEvent(new CustomEvent('dtm_attendance_update', { detail: INITIAL_ATTENDANCE_RECORDS }));
}

