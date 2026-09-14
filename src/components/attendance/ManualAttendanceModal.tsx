import React, { useState } from 'react';
import { Student } from '../../types/student';
import { AttendanceRecord, OverrideReason } from '../../types/attendance';
import { StatusBadge } from '../ui/StatusBadge';
import { markManualAttendance } from '../../services/attendanceService';
import { X, Check, ShieldCheck } from 'lucide-react';

interface ManualAttendanceModalProps {
  student: Student;
  currentRecord?: AttendanceRecord;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const REASONS: OverrideReason[] = [
  'RFID failed',
  'BLE verification failed',
  'ESP32 unavailable',
  'Technical issue',
  'Medical leave / Prior permission',
  'Other',
];

export const ManualAttendanceModal: React.FC<ManualAttendanceModalProps> = ({
  student,
  currentRecord,
  isOpen,
  onClose,
  onSaved,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<'PRESENT' | 'ABSENT'>('PRESENT');
  const [selectedReason, setSelectedReason] = useState<OverrideReason>(
    currentRecord?.bleStatus === 'FAILED'
      ? 'BLE verification failed'
      : currentRecord?.rfidStatus === 'FAILED'
      ? 'RFID failed'
      : 'BLE verification failed'
  );
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await markManualAttendance(
        student.studentId,
        selectedStatus,
        selectedReason,
        note,
        'TCH001',
        'Class Teacher'
      );
      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const todayDisplay = '14 Sep 2026';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div
        id="manual-attendance-modal"
        className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Teacher Attendance Override</h3>
              <p className="text-xs text-slate-400">Classroom C-304 &bull; Digital Technology & Management</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Student Overview Card */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Student</span>
                <h4 className="text-base font-bold text-white mt-0.5">{student.name}</h4>
                <p className="text-xs font-mono text-slate-400">{student.studentId} &bull; {student.department}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Session Date</span>
                <p className="text-xs font-semibold text-slate-200 mt-0.5">{todayDisplay}</p>
              </div>
            </div>

            {/* Current Hardware State */}
            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
              <span className="text-slate-400">Current Hardware Status:</span>
              <div className="flex items-center gap-2">
                <StatusBadge type="rfid" status={currentRecord?.rfidStatus || 'NOT_DETECTED'} size="sm" />
                <StatusBadge type="ble" status={currentRecord?.bleStatus || 'NOT_DETECTED'} size="sm" />
              </div>
            </div>
          </div>

          {/* Attendance Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Manual Attendance Decision
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                id="btn-select-present"
                onClick={() => setSelectedStatus('PRESENT')}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all border ${
                  selectedStatus === 'PRESENT'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-lg shadow-emerald-950/20'
                    : 'bg-slate-950/40 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>Mark Present</span>
              </button>

              <button
                type="button"
                id="btn-select-absent"
                onClick={() => setSelectedStatus('ABSENT')}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all border ${
                  selectedStatus === 'ABSENT'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-lg shadow-rose-950/20'
                    : 'bg-slate-950/40 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                <X className="w-4 h-4" />
                <span>Mark Absent</span>
              </button>
            </div>
          </div>

          {/* Reason Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Override Reason <span className="text-rose-400">*</span>
            </label>
            <select
              id="select-override-reason"
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value as OverrideReason)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
            >
              {REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Teacher Note / Audit Remarks (Optional)
            </label>
            <textarea
              id="input-teacher-note"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., Verified physical presence in classroom seat row 3..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Audit disclaimer */}
          <div className="text-[11px] text-slate-400 flex items-center gap-2 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
            <span>Audit trail will record: <strong>Manually verified by Class Teacher</strong> (ID: TCH001)</span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-confirm-attendance"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'CONFIRM ATTENDANCE'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
