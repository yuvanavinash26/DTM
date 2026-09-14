export type DeviceState = 'ONLINE' | 'OFFLINE' | 'SYNCING';

export interface ESP32Device {
  deviceId: string;
  name: string;
  classroom: string;
  ipAddress: string;
  macAddress: string;
  status: DeviceState;
  rfidReaderStatus: DeviceState;
  bleScannerStatus: DeviceState;
  lastHeartbeat: string;
  lastScanTime: string;
  lastRfidUid?: string;
  lastStudentName?: string;
  lastRssi?: number;
  firmwareVersion: string;
  uptimeSeconds: number;
}

// Contract definitions for future ESP32 endpoints
export interface RfidScanPayload {
  rfidUid: string;
  deviceId: string;
  timestamp: string; // ISO 8601 e.g. "2026-09-14T10:42:31+05:30"
}

export interface BleVerificationPayload {
  studentId: string;
  deviceId: string;
  rssi: number;
  verified: boolean;
  timestamp: string; // ISO 8601 e.g. "2026-09-14T10:42:40+05:30"
}
