import { ESP32Device } from '../types/device';

export const INITIAL_DEVICE: ESP32Device = {
  deviceId: 'DTM-ESP32-01',
  name: 'Classroom C-304 Gateway',
  classroom: 'Hall 304 - CSE Lab & Lecture',
  ipAddress: '192.168.1.142',
  macAddress: '24:6F:28:B4:7E:10',
  status: 'ONLINE',
  rfidReaderStatus: 'ONLINE',
  bleScannerStatus: 'ONLINE',
  lastHeartbeat: '10:42:35 AM',
  lastScanTime: '10:42:31 AM',
  lastRfidUid: '4A:D1:02:07',
  lastStudentName: 'Yuvan Avinash',
  lastRssi: -48,
  firmwareVersion: 'v2.4.1-rc3-esp-idf',
  uptimeSeconds: 86420,
};
