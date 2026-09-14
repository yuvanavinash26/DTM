import React, { useState, useEffect } from 'react';
import { User } from '../types/user';
import { Student } from '../types/student';
import { AttendanceRecord } from '../types/attendance';
import { getStudentById } from '../services/studentService';
import { getStudentAttendance } from '../services/attendanceService';
import { CircularProgress } from '../components/ui/CircularProgress';
import { StatusBadge } from '../components/ui/StatusBadge';
import { StudentWeeklyChart } from '../components/charts/StudentWeeklyChart';
import { formatDisplayDate } from '../utils/dateUtils';
import { useFlaskAttendance } from '../hooks/useFlaskAttendance';
import { formatLastSeen } from '../services/flaskAttendanceService';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Radio,
  Wifi,
  Award,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';

interface StudentDashboardProps {
  currentUser: User;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ currentUser }) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);

  const loadStudentData = async () => {
    const std = await getStudentById(currentUser.identifier);
    const attRecords = await getStudentAttendance(currentUser.identifier);
    setStudent(std);
    setRecords(attRecords);
  };

  useEffect(() => {
    loadStudentData();

    const handleUpdate = () => {
      loadStudentData();
    };

    window.addEventListener('dtm_attendance_update', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('dtm_attendance_update', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [currentUser.identifier]);

  if (!student) {
    return (
      <div className="p-8 text-center text-slate-400">
        Loading student attendance records...
      </div>
    );
  }

  // Today's record for this student
  const todayRecord = records.find((r) => r.date === '2026-09-14');

  return (
    <div className="space-y-6 pb-12" id="student-dashboard-view">
      {/* Student Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            Student Portal
          </span>
          <h2 className="text-2xl font-black tracking-tight text-white mt-1">
            Good morning, {student.name}
          </h2>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-2 font-mono">
            <span>Register No: <strong className="text-slate-200">{student.studentId}</strong></span>
            <span>&bull;</span>
            <span>Class: <strong className="text-slate-200">{student.department} ({student.semester})</strong></span>
            <span>&bull;</span>
            <span>Section: <strong className="text-slate-200">{student.section}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-950/70 px-4 py-2.5 rounded-xl border border-slate-800/80">
          <Award className="w-6 h-6 text-amber-400 shrink-0" />
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold text-slate-400">Eligibility Status</span>
            <p className="text-xs font-bold text-emerald-400">Exam Qualified (Above 75%)</p>
          </div>
        </div>
      </div>

      {/* Main Attendance Card & Today's Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Attendance Card with Circular Gauge */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col items-center justify-center text-center">
          <CircularProgress
            percentage={student.attendancePercentage}
            size={190}
            strokeWidth={15}
            label="CUMULATIVE"
            sublabel="Verified Record"
          />

          {/* Breakdown: Present, Absent, Total */}
          <div className="grid grid-cols-3 gap-2 w-full mt-6 pt-5 border-t border-slate-800/80 text-center">
            <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/60">
              <span className="text-[11px] font-semibold text-emerald-400 uppercase">Present</span>
              <p className="text-xl font-extrabold text-white mt-0.5">{student.presentClasses}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/60">
              <span className="text-[11px] font-semibold text-rose-400 uppercase">Absent</span>
              <p className="text-xl font-extrabold text-white mt-0.5">{student.absentClasses}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/60">
              <span className="text-[11px] font-semibold text-indigo-400 uppercase">Total</span>
              <p className="text-xl font-extrabold text-white mt-0.5">{student.totalClasses}</p>
            </div>
          </div>
        </div>

        {/* Today's Attendance Card */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Daily Verification
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  Today's Attendance Status
                </h3>
              </div>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                14 Sep 2026
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-5">
              {/* RFID Card Status */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-semibold">RFID Tag</span>
                  <Radio className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-sm font-bold text-white">
                  {todayRecord?.rfidStatus === 'VERIFIED' ? 'Verified' : todayRecord?.rfidStatus || 'Pending'}
                </p>
                <p className="text-[11px] font-mono text-indigo-300 truncate">
                  UID: {student.rfidUid}
                </p>
              </div>

              {/* BLE Status */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-semibold">BLE Beacon</span>
                  <Wifi className={`w-4 h-4 ${
                    todayRecord?.bleStatus === 'VERIFIED' || todayRecord?.bleStatus === 'PRESENT'
                      ? 'text-emerald-400'
                      : todayRecord?.bleStatus === 'FAILED' || todayRecord?.bleStatus === 'ABSENT'
                      ? 'text-rose-400'
                      : 'text-cyan-400'
                  }`} />
                </div>
                <p className={`text-sm font-bold ${
                  todayRecord?.bleStatus === 'VERIFIED' || todayRecord?.bleStatus === 'PRESENT'
                    ? 'text-emerald-400'
                    : todayRecord?.bleStatus === 'FAILED' || todayRecord?.bleStatus === 'ABSENT'
                    ? 'text-rose-400'
                    : 'text-white'
                }`}>
                  {todayRecord?.bleStatus === 'VERIFIED' || todayRecord?.bleStatus === 'PRESENT'
                    ? 'Present'
                    : todayRecord?.bleStatus === 'PENDING'
                    ? 'Verifying...'
                    : todayRecord?.bleStatus === 'FAILED' || todayRecord?.bleStatus === 'ABSENT'
                    ? 'Absent'
                    : 'Not Detected'}
                </p>
                <p className="text-[11px] font-mono text-cyan-300">
                  {todayRecord?.rssi !== null && todayRecord?.rssi !== undefined
                    ? `${todayRecord.rssi} dBm (RSSI)`
                    : todayRecord?.bleStatus === 'PRESENT' || todayRecord?.bleStatus === 'VERIFIED'
                    ? 'In Classroom Range'
                    : 'No Signal / Out of Range'}
                </p>
                {todayRecord?.lastSeen && (
                  <p className="text-[10px] text-slate-400 font-mono">
                    Last Seen: {formatLastSeen(todayRecord.lastSeen)}
                  </p>
                )}
              </div>

              {/* Entry Time */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-semibold">Entry Time</span>
                  <Clock className="w-4 h-4 text-indigo-400" />
                </div>
                <p className="text-sm font-bold text-white font-mono">
                  {todayRecord?.time || '—'}
                </p>
                <p className="text-[11px] text-slate-400">Classroom C-304</p>
              </div>

              {/* Final Status */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-semibold">Final Status</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <StatusBadge
                    type="final"
                    status={todayRecord?.finalStatus || 'PENDING'}
                    size="md"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  {todayRecord?.manualOverride ? 'Teacher Verified' : 'Dual Automated'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <span>Subject: <strong>Digital Technology &amp; Management</strong> (10:00 AM - 11:30 AM)</span>
            <span className="text-indigo-400 font-medium">Faculty: Prof. K. Sundaram</span>
          </div>
        </div>
      </div>

      {/* Attendance Performance Chart */}
      <StudentWeeklyChart studentName={student.name} />

      {/* RECENT ATTENDANCE TABLE */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden backdrop-blur-sm">
        <div className="px-6 py-4 bg-slate-950/70 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Recent Attendance History
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {records.length} Lecture Sessions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs" id="student-recent-attendance-table">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-4 py-3">Subject / Class</th>
                <th className="px-4 py-3">Entry Time</th>
                <th className="px-4 py-3">RFID</th>
                <th className="px-4 py-3">BLE</th>
                <th className="px-6 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {records.map((record) => (
                <tr
                  key={record.attendanceId}
                  className="hover:bg-slate-800/40 transition-colors"
                >
                  <td className="px-6 py-3.5 font-medium text-slate-200">
                    {formatDisplayDate(record.date)}
                  </td>
                  <td className="px-4 py-3.5 font-bold text-white">
                    {record.subject}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-slate-300">
                    {record.time}
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge type="rfid" status={record.rfidStatus} size="sm" />
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge type="ble" status={record.bleStatus} size="sm" />
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <StatusBadge type="final" status={record.finalStatus} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
