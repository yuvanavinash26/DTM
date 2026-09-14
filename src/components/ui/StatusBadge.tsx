import React from 'react';
import { RfidStatus, BleStatus, FinalAttendanceStatus } from '../../types/attendance';
import { Check, X, Clock, ShieldAlert, Edit3 } from 'lucide-react';

interface StatusBadgeProps {
  type: 'rfid' | 'ble' | 'final';
  status: RfidStatus | BleStatus | FinalAttendanceStatus | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  type,
  status,
  size = 'md',
  showIcon = true,
}) => {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 leading-tight',
    md: 'text-xs px-2.5 py-1 leading-tight',
    lg: 'text-xs px-3 py-1.5 font-bold leading-normal',
  }[size];

  // Specific RFID rendering
  if (type === 'rfid') {
    if (status === 'VERIFIED') {
      return (
        <span
          id={`badge-rfid-${status}`}
          className={`inline-flex items-center gap-1.5 font-semibold rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 ${sizeClasses}`}
        >
          {showIcon && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[2.5] shrink-0" />}
          <span className="leading-none">RFID Valid</span>
        </span>
      );
    }
    if (status === 'FAILED') {
      return (
        <span
          id={`badge-rfid-${status}`}
          className={`inline-flex items-center gap-1.5 font-semibold rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/25 ${sizeClasses}`}
        >
          {showIcon && <X className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 stroke-[2.5] shrink-0" />}
          <span className="leading-none">RFID Invalid</span>
        </span>
      );
    }
    return (
      <span
        id={`badge-rfid-${status}`}
        className={`inline-flex items-center gap-1 font-medium rounded-md bg-[var(--erp-card-subtle)] text-[var(--erp-text-muted)] border border-[var(--erp-border)] ${sizeClasses}`}
      >
        <span className="leading-none">RFID &mdash;</span>
      </span>
    );
  }

  // Specific BLE rendering
  if (type === 'ble') {
    if (status === 'VERIFIED' || status === 'PRESENT') {
      return (
        <span
          id={`badge-ble-${status}`}
          className={`inline-flex items-center gap-1.5 font-semibold rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 ${sizeClasses}`}
        >
          {showIcon && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[2.5] shrink-0" />}
          <span className="leading-none">{status === 'PRESENT' ? 'BLE Present' : 'BLE In-Range'}</span>
        </span>
      );
    }
    if (status === 'PENDING') {
      return (
        <span
          id={`badge-ble-${status}`}
          className={`inline-flex items-center gap-1.5 font-semibold rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 animate-pulse ${sizeClasses}`}
        >
          {showIcon && <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />}
          <span className="leading-none">BLE Scanning</span>
        </span>
      );
    }
    if (status === 'FAILED' || status === 'ABSENT') {
      return (
        <span
          id={`badge-ble-${status}`}
          className={`inline-flex items-center gap-1.5 font-semibold rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/25 ${sizeClasses}`}
        >
          {showIcon && <X className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 stroke-[2.5] shrink-0" />}
          <span className="leading-none">{status === 'ABSENT' ? 'BLE Absent' : 'BLE Out-of-Range'}</span>
        </span>
      );
    }
    return (
      <span
        id={`badge-ble-${status}`}
        className={`inline-flex items-center gap-1 font-medium rounded-md bg-[var(--erp-card-subtle)] text-[var(--erp-text-muted)] border border-[var(--erp-border)] ${sizeClasses}`}
      >
        <span className="leading-none">BLE &mdash;</span>
      </span>
    );
  }

  // Final Attendance Status
  if (status === 'PRESENT') {
    return (
      <span
        id={`badge-final-${status}`}
        className={`inline-flex items-center gap-1.5 font-bold rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 ${sizeClasses}`}
      >
        {showIcon && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[2.5] shrink-0" />}
        <span className="leading-none">PRESENT</span>
      </span>
    );
  }

  if (status === 'MANUALLY_MARKED') {
    return (
      <span
        id={`badge-final-${status}`}
        className={`inline-flex items-center gap-1.5 font-bold rounded-md bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30 ${sizeClasses}`}
      >
        {showIcon && <Edit3 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />}
        <span className="leading-none">FACULTY OVERRIDE</span>
      </span>
    );
  }

  if (status === 'PENDING') {
    return (
      <span
        id={`badge-final-${status}`}
        className={`inline-flex items-center gap-1.5 font-bold rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 ${sizeClasses}`}
      >
        {showIcon && <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />}
        <span className="leading-none">PENDING VERIFICATION</span>
      </span>
    );
  }

  if (status === 'ABSENT') {
    return (
      <span
        id={`badge-final-${status}`}
        className={`inline-flex items-center gap-1.5 font-bold rounded-md bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 ${sizeClasses}`}
      >
        {showIcon && <X className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 stroke-[2.5] shrink-0" />}
        <span className="leading-none">ABSENT</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 font-semibold rounded-md bg-[var(--erp-card-subtle)] text-[var(--erp-text-muted)] border border-[var(--erp-border)] ${sizeClasses}`}>
      <span className="leading-none">{status}</span>
    </span>
  );
};
