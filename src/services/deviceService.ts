import { ESP32Device } from '../types/device';
import { INITIAL_DEVICE } from '../data/deviceData';
import { formatShortTime } from '../utils/dateUtils';

const DEVICE_STORAGE_KEY = 'dtm_device_state';

export function getDeviceStatus(): ESP32Device {
  try {
    const stored = localStorage.getItem(DEVICE_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed reading device status', e);
  }
  localStorage.setItem(DEVICE_STORAGE_KEY, JSON.stringify(INITIAL_DEVICE));
  return INITIAL_DEVICE;
}

export function updateDeviceStatus(updates: Partial<ESP32Device>): ESP32Device {
  const current = getDeviceStatus();
  const updated: ESP32Device = {
    ...current,
    ...updates,
    lastHeartbeat: formatShortTime(new Date()),
  };
  localStorage.setItem(DEVICE_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('dtm_device_update', { detail: updated }));
  return updated;
}

export function recordDeviceScan(rfidUid: string, studentName: string, rssi: number = -48): ESP32Device {
  const nowStr = formatShortTime(new Date());
  return updateDeviceStatus({
    status: 'ONLINE',
    rfidReaderStatus: 'ONLINE',
    bleScannerStatus: 'ONLINE',
    lastScanTime: nowStr,
    lastRfidUid: rfidUid,
    lastStudentName: studentName,
    lastRssi: rssi,
  });
}
