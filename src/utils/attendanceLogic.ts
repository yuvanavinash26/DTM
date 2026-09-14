import {
  FinalAttendanceStatus,
  RfidStatus,
  BleStatus,
  VerificationMethod,
} from '../types/attendance';

export function computeFinalStatus(
  rfidStatus: RfidStatus,
  bleStatus: BleStatus,
  manualOverride: boolean = false
): FinalAttendanceStatus {
  if (manualOverride) {
    return 'MANUALLY_MARKED';
  }

  if (rfidStatus === 'VERIFIED' && (bleStatus === 'VERIFIED' || bleStatus === 'PRESENT')) {
    return 'PRESENT';
  }

  if (rfidStatus === 'VERIFIED' && bleStatus === 'PENDING') {
    return 'PENDING';
  }

  if (rfidStatus === 'VERIFIED' && (bleStatus === 'FAILED' || bleStatus === 'ABSENT')) {
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
  if (rfidStatus === 'VERIFIED' && (bleStatus === 'VERIFIED' || bleStatus === 'PRESENT')) return 'RFID_BLE';
  if (rfidStatus === 'VERIFIED') return 'RFID_ONLY';
  return 'UNVERIFIED';
}

/**
 * Dispatches standard system toasts matching exact specification
 */
export function dispatchAttendanceToast(detail: {
  title: string;
  studentName?: string;
  studentId?: string;
  statusText: string;
  variant?: 'emerald' | 'amber' | 'rose' | 'purple' | 'blue';
}) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('dtm_toast_event', {
        detail: {
          ...detail,
          id: `toast_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        },
      })
    );
  }
}
