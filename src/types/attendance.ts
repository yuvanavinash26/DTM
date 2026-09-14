export type RfidStatus = 'VERIFIED' | 'FAILED' | 'NOT_DETECTED';
export type BleStatus = 'VERIFIED' | 'FAILED' | 'NOT_DETECTED' | 'PENDING' | 'PRESENT' | 'ABSENT';
export type FinalAttendanceStatus = 'PRESENT' | 'ABSENT' | 'PENDING' | 'MANUALLY_MARKED' | 'NOT_ATTENDED';
export type VerificationMethod = 'RFID_BLE' | 'MANUAL' | 'RFID_ONLY' | 'UNVERIFIED';

export interface FlaskAttendanceResponse {
  student: string;
  student_id?: string;
  phone_address?: string;
  bluetooth: 'PRESENT' | 'ABSENT' | string;
  attendance: 'PRESENT' | 'ABSENT' | string;
  rssi: number | null;
  last_seen: number | string | null;
}

export interface FlaskConnectionState {
  status: 'CONNECTED' | 'OFFLINE' | 'CONNECTING';
  endpoint: string;
  lastChecked: string | null;
  lastSeenFormatted: string | null;
  lastData: FlaskAttendanceResponse | null;
  errorMessage: string | null;
  consecutiveErrors: number;
}

export type OverrideReason = 
  | 'RFID failed'
  | 'BLE verification failed'
  | 'ESP32 unavailable'
  | 'Technical issue'
  | 'Medical leave / Prior permission'
  | 'Other';

export interface AttendanceRecord {
  id: string;
  attendanceId?: string; // Backwards compatibility alias
  studentId: string;
  studentName: string;
  rfidUid: string;
  date: string; // e.g. "14 Sep 2026" or "2026-09-14"
  day?: string; // "Monday", "Tuesday", etc.
  period: number | string;
  subject: string;
  subjectCode: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  time?: string; // Formatted time
  timestamp: string; // ISO 8601
  rfidStatus: RfidStatus;
  bleStatus: BleStatus;
  finalStatus: FinalAttendanceStatus;
  verificationMethod?: VerificationMethod;
  entryTime?: string;
  verificationTime?: string;
  exitTime?: string;
  exitReason?: string;
  manualOverride: boolean;
  teacherId?: string;
  teacherName?: string;
  reason?: string;
  note?: string;
  rssi?: number;
  phoneAddress?: string;
  lastSeen?: number | string | null;
  deviceId?: string;
}

export interface AttendanceStats {
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  pendingToday: number;
  attendanceRate: number;
  rfidVerifiedCount: number;
  bleVerifiedCount: number;
  manualOverrideCount: number;
  rfidFailuresCount: number;
  bleFailuresCount: number;
}

export interface WeeklyAttendancePoint {
  day: string; // 'Monday', 'Tuesday', ...
  date: string;
  presentCount: number;
  absentCount: number;
  rate: number;
}
