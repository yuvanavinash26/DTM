import React, { useState, useEffect } from 'react';
import { Student } from '../types/student';
import { AttendanceRecord } from '../types/attendance';
import { getStudentAttendance } from '../services/attendanceService';
import { CircularProgress } from '../components/ui/CircularProgress';
import { StatusBadge } from '../components/ui/StatusBadge';
import { StudentWeeklyChart } from '../components/charts/StudentWeeklyChart';
import { ManualAttendanceModal } from '../components/attendance/ManualAttendanceModal';
import { formatDisplayDate } from '../utils/dateUtils';
import {
  ArrowLeft,
  Mail,
  Phone,
  Radio,
  Wifi,
  ShieldAlert,
  Edit3,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

interface StudentDetailsProps {
  student: Student;
  onBack: () => void;
}

export const StudentDetails: React.FC<StudentDetailsProps> = ({ student, onBack }) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadRecords = async () => {
    const list = await getStudentAttendance(student.studentId);
    setRecords(list);
  };

  useEffect(() => {
    loadRecords();
    const handleUpdate = () => loadRecords();
    window.addEventListener('dtm_attendance_update', handleUpdate);
    return () => window.removeEventListener('dtm_attendance_update', handleUpdate);
  }, [student.studentId]);

  const manualOverrides = records.filter((r) => r.manualOverride);
  const bleFailures = records.filter((r) => r.bleStatus === 'FAILED');

  return (
    <div className="space-y-6 pb-12" id="student-details-view">
      {/* Back button & Title */}
      <div className="flex items-center justify-between">
        <button
          id="btn-back-to-roster"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Roster</span>
        </button>

        <button
          id="btn-manual-override-details"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition-all text-xs font-bold uppercase tracking-wider"
        >
          <Edit3 className="w-4 h-4" />
          <span>Mark Attendance</span>
        </button>
      </div>

      {/* Profile & Metric Hero Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Profile Card */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-2xl font-black text-white shadow-lg">
                {student.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-black text-white">{student.name}</h2>
                <p className="text-xs font-mono text-slate-400 mt-0.5">
                  Register No: <strong className="text-white">{student.studentId}</strong>
                </p>
                <p className="text-xs text-indigo-400 font-medium mt-0.5">
                  {student.department} &bull; {student.semester} &bull; Section {student.section}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-1">
              <div className="flex items-center gap-2 text-slate-400">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{student.email}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{student.phone}</span>
              </div>
            </div>
          </div>

          {/* Hardware Credentials */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-800/80">
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Assigned RFID UID</span>
                <p className="text-sm font-mono font-bold text-emerald-400 mt-0.5">
                  {student.rfidUid}
                </p>
              </div>
              <Radio className="w-5 h-5 text-emerald-400" />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase">BLE Phone Signature</span>
                <p className="text-sm font-mono font-bold text-cyan-400 mt-0.5">
                  {student.bleDeviceId || 'DTM_BLE_DEVICE'}
                </p>
              </div>
              <Wifi className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
        </div>

        {/* Circular Progress & Breakdown */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col items-center justify-center text-center">
          <CircularProgress
            percentage={student.attendancePercentage}
            size={180}
            strokeWidth={14}
            label="ATTENDANCE"
          />

          <div className="grid grid-cols-3 gap-2 w-full mt-5 pt-4 border-t border-slate-800/80">
            <div className="p-2 rounded-lg bg-slate-950/60 text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-400">Present</span>
              <p className="text-lg font-bold text-white">{student.presentClasses}</p>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/60 text-center">
              <span className="text-[10px] uppercase font-bold text-rose-400">Absent</span>
              <p className="text-lg font-bold text-white">{student.absentClasses}</p>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/60 text-center">
              <span className="text-[10px] uppercase font-bold text-indigo-400">Total</span>
              <p className="text-lg font-bold text-white">{student.totalClasses}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <StudentWeeklyChart studentName={student.name} />

      {/* Audit Log: Manual Overrides & BLE Failures */}
      {manualOverrides.length > 0 && (
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-purple-500/30 shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <Edit3 className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white">Manual Override Audit Trail</h3>
          </div>
          <div className="space-y-2">
            {manualOverrides.map((ov) => (
              <div
                key={ov.attendanceId}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{formatDisplayDate(ov.date)}</span>
                    <span className="text-slate-400">&bull; {ov.subject}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300">
                      Reason: {ov.reason}
                    </span>
                  </div>
                  {ov.note && (
                    <p className="text-slate-400 mt-1 italic">"{ov.note}"</p>
                  )}
                </div>
                <span className="text-slate-400 font-mono text-[11px] shrink-0">
                  Verified by: <strong>{ov.teacherName || 'Class Teacher'}</strong>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Attendance History */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-950/70 border-b border-slate-800/80 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Full Attendance Verification History</h3>
          <span className="text-xs text-slate-400 font-mono">{records.length} Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="px-5 py-3">Date</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">RFID</th>
                <th className="px-4 py-3">BLE</th>
                <th className="px-4 py-3">Final Status</th>
                <th className="px-5 py-3 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {records.map((r) => (
                <tr key={r.attendanceId} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-slate-200">
                    {formatDisplayDate(r.date)}
                  </td>
                  <td className="px-4 py-3.5 font-bold text-white">{r.subject}</td>
                  <td className="px-4 py-3.5 font-mono text-slate-300">{r.time}</td>
                  <td className="px-4 py-3.5">
                    <StatusBadge type="rfid" status={r.rfidStatus} size="sm" />
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge type="ble" status={r.bleStatus} size="sm" />
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge type="final" status={r.finalStatus} size="sm" />
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono text-slate-400">
                    {r.verificationMethod}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Override Modal */}
      <ManualAttendanceModal
        student={student}
        currentRecord={records.find((r) => r.date === '2026-09-14')}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={loadRecords}
      />
    </div>
  );
};
