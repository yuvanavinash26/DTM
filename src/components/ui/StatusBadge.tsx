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
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  }[size];

  // Specific RFID rendering
  if (type === 'rfid') {
    if (status === 'VERIFIED') {
      return (
        <span
          id={`badge-rfid-${status}`}
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ${sizeClasses}`}
        >
          {showIcon && <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />}
          <span>RFID ✓</span>
        </span>
      );
    }
    if (status === 'FAILED') {
      return (
        <span
          id={`badge-rfid-${status}`}
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 ${sizeClasses}`}
        >
          {showIcon && <X className="w-3.5 h-3.5 text-rose-400 stroke-[2.5]" />}
          <span>RFID ✕</span>
        </span>
      );
    }
    return (
      <span
        id={`badge-rfid-${status}`}
        className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-slate-800 text-slate-400 border border-slate-700 ${sizeClasses}`}
      >
        <span>RFID —</span>
      </span>
    );
  }

  // Specific BLE rendering
  if (type === 'ble') {
    if (status === 'VERIFIED' || status === 'PRESENT') {
      return (
        <span
          id={`badge-ble-${status}`}
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 ${sizeClasses}`}
        >
          {showIcon && <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />}
          <span>{status === 'PRESENT' ? 'BLE PRESENT' : 'BLE ✓'}</span>
        </span>
      );
    }
    if (status === 'PENDING') {
      return (
        <span
          id={`badge-ble-${status}`}
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse ${sizeClasses}`}
        >
          {showIcon && <Clock className="w-3.5 h-3.5 text-amber-400" />}
          <span>BLE •••</span>
        </span>
      );
    }
    if (status === 'FAILED' || status === 'ABSENT') {
      return (
        <span
          id={`badge-ble-${status}`}
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 ${sizeClasses}`}
        >
          {showIcon && <X className="w-3.5 h-3.5 text-rose-400 stroke-[2.5]" />}
          <span>{status === 'ABSENT' ? 'BLE ABSENT' : 'BLE ✕'}</span>
        </span>
      );
    }
    return (
      <span
        id={`badge-ble-${status}`}
        className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-slate-800 text-slate-400 border border-slate-700 ${sizeClasses}`}
      >
        <span>BLE —</span>
      </span>
    );
  }

  // Final Attendance Status
  if (status === 'PRESENT') {
    return (
      <span
        id={`badge-final-${status}`}
        className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 ${sizeClasses}`}
      >
        {showIcon && <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />}
        <span>PRESENT</span>
      </span>
    );
  }

  if (status === 'MANUALLY_MARKED') {
    return (
      <span
        id={`badge-final-${status}`}
        className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 ${sizeClasses}`}
      >
        {showIcon && <Edit3 className="w-3.5 h-3.5 text-purple-400" />}
        <span>MANUAL</span>
      </span>
    );
  }

  if (status === 'PENDING') {
    return (
      <span
        id={`badge-final-${status}`}
        className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 ${sizeClasses}`}
      >
        {showIcon && <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />}
        <span>PENDING REVIEW</span>
      </span>
    );
  }

  if (status === 'ABSENT') {
    return (
      <span
        id={`badge-final-${status}`}
        className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 ${sizeClasses}`}
      >
        {showIcon && <X className="w-3.5 h-3.5 text-rose-400 stroke-[2.5]" />}
        <span>ABSENT</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-slate-800 text-slate-300 ${sizeClasses}`}>
      {status}
    </span>
  );
};
