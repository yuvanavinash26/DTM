import { FinalAttendanceStatus, RfidStatus, BleStatus, VerificationMethod } from '../types/attendance';

export function computeFinalStatus(
  rfidStatus: RfidStatus,
  bleStatus: BleStatus,
  manualOverride: boolean = false
): FinalAttendanceStatus {
  if (manualOverride) {
    return 'MANUALLY_MARKED';
  }

  if (rfidStatus === 'VERIFIED' && bleStatus === 'VERIFIED') {
    return 'PRESENT';
  }

  if (rfidStatus === 'VERIFIED' && bleStatus === 'PENDING') {
    return 'PENDING';
  }

  if (rfidStatus === 'VERIFIED' && bleStatus === 'FAILED') {
    return 'PENDING'; // teacher review required
  }

  if (rfidStatus === 'NOT_DETECTED' || rfidStatus === 'FAILED') {
    return 'ABSENT';
  }

  return 'PENDING';
}

export function determineVerificationMethod(
  rfidStatus: RfidStatus,
  bleStatus: BleStatus,
  manualOverride: boolean
): VerificationMethod {
  if (manualOverride) return 'MANUAL';
  if (rfidStatus === 'VERIFIED' && bleStatus === 'VERIFIED') return 'RFID_BLE';
  if (rfidStatus === 'VERIFIED') return 'RFID_ONLY';
  return 'UNVERIFIED';
}
