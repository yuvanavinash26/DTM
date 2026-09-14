import {
  FlaskAttendanceResponse,
  FlaskConnectionState,
  AttendanceRecord,
  RfidStatus,
  BleStatus,
  FinalAttendanceStatus,
} from '../types/attendance';
import { INITIAL_STUDENTS } from '../data/students';
import { getAttendanceRecordsInternal } from './attendanceService';
import { updateDeviceStatus } from './deviceService';
import { formatShortTime } from '../utils/dateUtils';
import { computeFinalStatus, determineVerificationMethod } from '../utils/attendanceLogic';

export const DEFAULT_FLASK_ENDPOINT = 'http://localhost:8000/api/attendance';
const FLASK_ENDPOINT_KEY = 'dtm_flask_endpoint';

export function getFlaskEndpoint(): string {
  try {
    const saved = localStorage.getItem(FLASK_ENDPOINT_KEY);
    if (saved && saved.trim()) {
      return saved.trim();
    }
  } catch (e) {
    // Ignore storage issues
  }
  return DEFAULT_FLASK_ENDPOINT;
}

export function setFlaskEndpoint(url: string): void {
  localStorage.setItem(FLASK_ENDPOINT_KEY, url.trim());
  connectionState.endpoint = url.trim();
  notifyStateChange();
}

export function resetFlaskEndpoint(): void {
  localStorage.removeItem(FLASK_ENDPOINT_KEY);
  connectionState.endpoint = DEFAULT_FLASK_ENDPOINT;
  notifyStateChange();
}

export function formatLastSeen(lastSeen: number | string | null | undefined): string {
  if (lastSeen === null || lastSeen === undefined || lastSeen === '') {
    return 'Not detected';
  }

  // If number (epoch seconds or milliseconds)
  if (typeof lastSeen === 'number') {
    const ms = lastSeen < 1e11 ? lastSeen * 1000 : lastSeen;
    const date = new Date(ms);
    if (!isNaN(date.getTime())) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
    }
  }

  // If string
  if (typeof lastSeen === 'string') {
    const num = Number(lastSeen);
    if (!isNaN(num) && num > 0) {
      return formatLastSeen(num);
    }
    const parsedDate = new Date(lastSeen);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
    }
    return lastSeen;
  }

  return String(lastSeen);
}

// In-memory connection state
let connectionState: FlaskConnectionState = {
  status: 'CONNECTING',
  endpoint: getFlaskEndpoint(),
  lastChecked: null,
  lastSeenFormatted: null,
  lastData: null,
  errorMessage: null,
  consecutiveErrors: 0,
};

function notifyStateChange(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('dtm_flask_status', { detail: { ...connectionState } })
    );
  }
}

export function getFlaskConnectionState(): FlaskConnectionState {
  return { ...connectionState };
}

/**
 * Applies incoming Flask attendance payload into attendance records and triggers updates
 */
function applyFlaskAttendance(data: FlaskAttendanceResponse): void {
  const records = getAttendanceRecordsInternal();
  const dateStr = '2026-09-14'; // Standardized session date

  // Match student by name or ID
  const student = INITIAL_STUDENTS.find(
    (s) =>
      s.name.toLowerCase() === data.student.toLowerCase() ||
      s.studentId.toLowerCase() === data.student.toLowerCase()
  );

  const studentId = student ? student.studentId : 'RA25110030200411';
  const studentName = student ? student.name : data.student;
  const rfidUid = student ? student.rfidUid : '4A:D1:02:07';

  const index = records.findIndex(
    (r) => r.date === dateStr && (r.studentId === studentId || r.studentName.toLowerCase() === data.student.toLowerCase())
  );

  const isBluetoothPresent = String(data.bluetooth).toUpperCase() === 'PRESENT';
  const bleStatus: BleStatus = isBluetoothPresent ? 'PRESENT' : 'ABSENT';

  let updatedRecord: AttendanceRecord;

  if (index >= 0) {
    const existing = records[index];

    // If teacher already applied a manual override, we preserve manual override status,
    // but update the real-time BLE telemetry (RSSI, BLE status, phone address)
    let finalStat: FinalAttendanceStatus = existing.finalStatus;
    let method = existing.verificationMethod;

    if (!existing.manualOverride) {
      if (existing.rfidStatus === 'VERIFIED' && isBluetoothPresent) {
        finalStat = 'PRESENT';
        method = 'RFID_BLE';
      } else if (existing.rfidStatus === 'VERIFIED' && !isBluetoothPresent) {
        finalStat = 'PENDING'; // Unverified because Bluetooth is absent
        method = 'RFID_ONLY';
      } else if (existing.rfidStatus !== 'VERIFIED') {
        finalStat = isBluetoothPresent ? 'PENDING' : 'ABSENT';
        method = 'UNVERIFIED';
      }
    }

    updatedRecord = {
      ...existing,
      bleStatus,
      finalStatus: finalStat,
      verificationMethod: method,
      rssi: data.rssi !== null && data.rssi !== undefined ? data.rssi : undefined,
      phoneAddress: data.phone_address,
      lastSeen: data.last_seen,
    };
    records[index] = updatedRecord;
  } else {
    // Student record not present for today yet: create one
    const now = new Date();
    const finalStat: FinalAttendanceStatus = isBluetoothPresent ? 'PENDING' : 'ABSENT';

    updatedRecord = {
      attendanceId: `att_${Date.now()}`,
      studentId,
      studentName,
      rfidUid,
      date: dateStr,
      time: formatShortTime(now),
      timestamp: `${dateStr}T${now.toTimeString().split(' ')[0]}+05:30`,
      subject: 'Digital Technology & Management',
      rfidStatus: 'NOT_DETECTED',
      bleStatus,
      finalStatus: finalStat,
      verificationMethod: 'UNVERIFIED',
      manualOverride: false,
      rssi: data.rssi !== null && data.rssi !== undefined ? data.rssi : undefined,
      phoneAddress: data.phone_address,
      lastSeen: data.last_seen,
      deviceId: 'DTM-ESP32-01',
    };
    records.unshift(updatedRecord);
  }

  // Persist into localStorage and broadcast update
  localStorage.setItem('dtm_attendance_records', JSON.stringify(records));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('dtm_attendance_update', { detail: records }));
  }

  // Update hardware gateway monitor
  updateDeviceStatus({
    bleScannerStatus: isBluetoothPresent ? 'ONLINE' : 'ONLINE',
    lastStudentName: studentName,
    lastRssi: data.rssi !== null && data.rssi !== undefined ? data.rssi : undefined,
  });
}

/**
 * Primary service function required by specification:
 * Fetches attendance status from local Flask backend at http://localhost:8000/api/attendance
 */
export async function fetchAttendanceStatus(
  customUrl?: string
): Promise<FlaskAttendanceResponse> {
  const url = customUrl || getFlaskEndpoint();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 1800);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
    }

    const data: FlaskAttendanceResponse = await response.json();

    // Update state to CONNECTED
    connectionState = {
      status: 'CONNECTED',
      endpoint: url,
      lastChecked: formatShortTime(new Date()),
      lastSeenFormatted: formatLastSeen(data.last_seen),
      lastData: data,
      errorMessage: null,
      consecutiveErrors: 0,
    };

    // Apply into the application records
    applyFlaskAttendance(data);
    notifyStateChange();

    return data;
  } catch (error: any) {
    clearTimeout(timeoutId);

    const isAbort = error?.name === 'AbortError';
    const isCorsOrNetwork =
      error?.message?.includes('Failed to fetch') ||
      error?.message?.includes('NetworkError') ||
      isAbort;

    let friendlyMessage = 'Backend Offline';
    if (isAbort) {
      friendlyMessage = 'Flask request timed out (>1.8s)';
    } else if (isCorsOrNetwork) {
      friendlyMessage =
        'Backend Offline or CORS blocked. Ensure Flask is running at ' +
        url +
        ' and has CORS enabled (from flask_cors import CORS; CORS(app)).';
    } else {
      friendlyMessage = error?.message || 'Error communicating with Flask';
    }

    connectionState = {
      ...connectionState,
      status: 'OFFLINE',
      endpoint: url,
      lastChecked: formatShortTime(new Date()),
      errorMessage: friendlyMessage,
      consecutiveErrors: connectionState.consecutiveErrors + 1,
    };

    notifyStateChange();
    throw error;
  }
}
