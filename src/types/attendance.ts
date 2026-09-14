export type RfidStatus = 'VERIFIED' | 'FAILED' | 'NOT_DETECTED';
export type BleStatus = 'VERIFIED' | 'FAILED' | 'NOT_DETECTED' | 'PENDING' | 'PRESENT' | 'ABSENT';
export type FinalAttendanceStatus = 'PRESENT' | 'ABSENT' | 'MANUALLY_MARKED' | 'PENDING';
export type VerificationMethod = 'RFID_BLE' | 'MANUAL' | 'RFID_ONLY' | 'UNVERIFIED';

export interface FlaskAttendanceResponse {
  student: string;
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
  attendanceId: string;
  studentId: string;
  studentName: string;
  rfidUid: string;
  date: string; // YYYY-MM-DD or formatted display
  time: string; // HH:MM:SS AM/PM
  timestamp: string; // ISO 8601
  subject: string;
  rfidStatus: RfidStatus;
  bleStatus: BleStatus;
  finalStatus: FinalAttendanceStatus;
  verificationMethod: VerificationMethod;
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
