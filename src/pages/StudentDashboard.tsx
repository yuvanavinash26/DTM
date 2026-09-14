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
import { getCurrentClass } from '../services/timetableService';
import { getActiveVenue } from '../services/venueService';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Radio,
  Wifi,
  WifiOff,
  Award,
  AlertCircle,
  FileSpreadsheet,
  RefreshCw,
  Smartphone,
  Activity,
  Signal,
  Terminal,
  HelpCircle,
} from 'lucide-react';

interface StudentDashboardProps {
  currentUser: User;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ currentUser }) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [currentClass, setCurrentClass] = useState(getCurrentClass());
  const [currentVenue, setCurrentVenue] = useState(getActiveVenue());

  useEffect(() => {
    const handleVenue = () => setCurrentVenue(getActiveVenue());
    window.addEventListener('dtm_venue_change', handleVenue);
    return () => window.removeEventListener('dtm_venue_change', handleVenue);
  }, []);

  // Live Flask attendance polling hook (every 2000ms from http://localhost:8000/api/attendance)
  const {
    isConnected,
    isOffline,
    lastChecked,
    lastSeenFormatted,
    lastData,
    errorMessage,
    endpoint,
    triggerRetry,
    isRetrying,
  } = useFlaskAttendance(2000);

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
  const todayRecord = records.find((r) => r.date === '2026-09-14') || records[0];

  // Dynamic live BLE status: prioritizes live Flask payload if student matches
  const defaultMac =
    student.macAddress ||
    (student.studentId === 'RA2511003020043' ? '59:6C:16:3A:DD:BE' : '7B:E0:C6:3A:DD:BE');

  const isFlaskStudentMatch =
    Boolean(lastData &&
      (lastData.student?.toLowerCase() === student.name.toLowerCase() ||
        lastData.student_id?.toLowerCase() === student.studentId.toLowerCase() ||
        lastData.student?.toLowerCase() === student.studentId.toLowerCase()));

  const liveBluetoothPresent = isConnected && isFlaskStudentMatch
    ? String(lastData?.bluetooth).toUpperCase() === 'PRESENT'
    : todayRecord?.bleStatus === 'PRESENT' || todayRecord?.bleStatus === 'VERIFIED';

  const liveRssi = isConnected && isFlaskStudentMatch && lastData?.rssi !== null && lastData?.rssi !== undefined
    ? lastData.rssi
    : todayRecord?.rssi ?? -48;

  const livePhoneAddress = isConnected && isFlaskStudentMatch && lastData?.phone_address
    ? lastData.phone_address
    : todayRecord?.phoneAddress || defaultMac;

  const liveSeenText = isConnected && isFlaskStudentMatch && lastSeenFormatted
    ? lastSeenFormatted
    : todayRecord?.lastSeen
    ? formatLastSeen(todayRecord.lastSeen)
    : 'Active Now';

  // Compute signal strength bars (1 to 4)
  const getSignalStrength = (rssiVal: number) => {
    if (rssiVal >= -50) return { bars: 4, text: 'Strong', color: 'text-emerald-400', bg: 'bg-emerald-400' };
    if (rssiVal >= -68) return { bars: 3, text: 'Good', color: 'text-emerald-400', bg: 'bg-emerald-400' };
    if (rssiVal >= -80) return { bars: 2, text: 'Fair', color: 'text-amber-400', bg: 'bg-amber-400' };
    return { bars: 1, text: 'Weak', color: 'text-rose-400', bg: 'bg-rose-400' };
  };

  const signalInfo = getSignalStrength(liveRssi);

  return (
    <div className="space-y-6 pb-12" id="student-dashboard-view">
      {/* Student Welcome Header / Dossier Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl erp-card shadow-md">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">
            Student Academic Dossier
          </span>
          <h2 className="text-2xl font-black tracking-tight text-[var(--erp-text-main)] mt-1">
            Welcome, {student.name}
          </h2>
          <div className="flex flex-wrap items-center gap-2.5 text-xs text-[var(--erp-text-muted)] mt-2 font-mono">
            <span>Roll Number: <strong className="text-[var(--erp-text-main)] font-semibold">{student.studentId}</strong></span>
            <span>&bull;</span>
            <span>Program: <strong className="text-[var(--erp-text-main)] font-semibold">{student.department} ({student.semester})</strong></span>
            <span>&bull;</span>
            <span>Section: <strong className="text-[var(--erp-text-main)] font-semibold">{student.section}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-[var(--erp-card-subtle)] px-4 py-2.5 rounded-xl border border-[var(--erp-border)]">
          <Award className="w-6 h-6 text-amber-500 shrink-0" />
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold text-[var(--erp-text-faint)]">Exam Eligibility</span>
            <p className="text-xs font-bold text-emerald-500">Qualified (&gt;= 75% Criteria Met)</p>
          </div>
        </div>
      </div>

      {/* LIVE FLASK BACKEND & BLE DETECTION PANEL */}
      <div
        id="student-flask-ble-panel"
        className={`rounded-2xl border p-5 transition-all duration-300 shadow-md erp-card ${
          isConnected
            ? 'border-emerald-500/40 bg-[var(--erp-card)]'
            : 'border-amber-500/30 bg-[var(--erp-card)]'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[var(--erp-border)]">
          {/* Header identity */}
          <div className="flex items-start sm:items-center gap-3">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                isConnected
                  ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 shadow-sm'
                  : 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
              }`}
            >
              {isConnected ? (
                <Radio className="w-5 h-5 text-emerald-500 animate-pulse" />
              ) : (
                <WifiOff className="w-5 h-5 text-amber-500" />
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-extrabold text-[var(--erp-text-main)] tracking-tight">
                  LIVE BIOMETRIC TELEMETRY
                </h3>
                {isConnected ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Biometric Receiver Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    Backend Waiting on :8000
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-[var(--erp-text-muted)]">
                <span className="font-mono text-[var(--erp-text-main)] bg-[var(--erp-card-subtle)] px-2 py-0.5 rounded border border-[var(--erp-border)]">
                  {endpoint}
                </span>
                <span>&bull;</span>
                <span className="font-mono text-[11px] text-[var(--erp-text-muted)]">
                  Cycle: 2s &bull; Last Heartbeat: {lastChecked || 'Active'}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 self-start lg:self-center">
            <button
              type="button"
              id="btn-student-toggle-guide"
              onClick={() => setShowSetupGuide(!showSetupGuide)}
              className="px-3 py-1.5 rounded-xl bg-[var(--erp-card-subtle)] hover:bg-[var(--erp-card-hover)] text-[var(--erp-text-main)] text-xs font-semibold flex items-center gap-1.5 border border-[var(--erp-border)] transition-all erp-btn"
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-500" />
              <span>{showSetupGuide ? 'Hide Python Config' : 'Python Server Config'}</span>
            </button>

            <button
              type="button"
              id="btn-student-poll-retry"
              onClick={triggerRetry}
              disabled={isRetrying}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all erp-btn disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`}
              />
              <span>{isRetrying ? 'Polling...' : 'Sync Gateway'}</span>
            </button>
          </div>
        </div>

        {/* Expandable Flask Python server setup guide */}
        {showSetupGuide && (
          <div className="mt-4 p-4 rounded-xl bg-[var(--erp-card-subtle)] border border-[var(--erp-border)] text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[var(--erp-text-main)] flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-500" />
                Python Local BLE Beacon Feed (`flask_backend_server.py`)
              </span>
              <span className="text-[11px] font-mono text-emerald-500 font-semibold">Roll No: {student.studentId}</span>
            </div>
            <p className="text-[var(--erp-text-muted)] text-[11px] leading-relaxed">
              Run the included Python gateway script in your local environment to stream BLE beacon signals directly to your student dashboard:
            </p>
            <pre className="p-3 bg-[var(--erp-card)] rounded-lg text-emerald-500 font-mono text-[11px] overflow-x-auto border border-[var(--erp-border)]">
{`# Run in terminal:
python flask_backend_server.py

# Expected live JSON payload:
{
  "student": "${student.name}",
  "phone_address": "${defaultMac}",
  "bluetooth": "PRESENT",
  "attendance": "PRESENT",
  "rssi": -54,
  "last_seen": 1770000000
}`}
            </pre>
          </div>
        )}

        {/* Live BLE Detection Telemetry Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-4">
          {/* 1. BLE Presence Status */}
          <div className="p-3.5 rounded-xl bg-[var(--erp-card-subtle)] border border-[var(--erp-border)] flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--erp-text-faint)]">
                BLE Proximity State
              </span>
              <p
                className={`text-sm font-extrabold flex items-center gap-1.5 ${
                  liveBluetoothPresent ? 'text-emerald-500' : 'text-rose-500'
                }`}
              >
                {liveBluetoothPresent ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>IN CLASSROOM BOUNDARY</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    <span>OUT OF BOUNDARY</span>
                  </>
                )}
              </p>
              <p className="text-[11px] text-[var(--erp-text-muted)] font-mono">
                {liveBluetoothPresent ? 'Verified with RFID session' : 'BLE beacon not detected'}
              </p>
            </div>
          </div>

          {/* 2. Proximity & RSSI Signal Meter */}
          <div className="p-3.5 rounded-xl bg-[var(--erp-card-subtle)] border border-[var(--erp-border)] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--erp-text-faint)]">
                RSSI Signal Strength
              </span>
              <span className={`text-[11px] font-bold ${signalInfo.color}`}>
                {signalInfo.text}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black font-mono text-teal-500 tabular-nums">
                {liveRssi}
              </span>
              <span className="text-xs text-[var(--erp-text-muted)] font-mono">dBm</span>

              {/* Signal Bars */}
              <div className="flex items-end gap-1 ml-auto h-4">
                {[1, 2, 3, 4].map((bar) => (
                  <span
                    key={bar}
                    className={`w-1 rounded-sm transition-all ${
                      bar <= signalInfo.bars
                        ? `${signalInfo.bg}`
                        : 'bg-slate-700'
                    }`}
                    style={{ height: `${bar * 4 + 2}px` }}
                  />
                ))}
              </div>
            </div>

            <p className="text-[10px] text-[var(--erp-text-muted)] truncate">
              {liveRssi >= -60
                ? 'Distance: < 2.0m (Desk Zone)'
                : liveRssi >= -75
                ? 'Distance: 2.0m - 5.0m (Classroom Perimeter)'
                : 'Distance: > 5.0m (Perimeter Edge)'}
            </p>
          </div>

          {/* 3. Phone Bluetooth MAC */}
          <div className="p-3.5 rounded-xl bg-[var(--erp-card-subtle)] border border-[var(--erp-border)] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--erp-text-faint)]">
                Device MAC Address
              </span>
              <Smartphone className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-sm font-bold font-mono text-[var(--erp-text-main)] truncate tabular-nums">
              {livePhoneAddress}
            </p>
            <p className="text-[10px] text-teal-500 font-mono">
              Beacon Node: DTM_BLE_{student.name.split(' ')[0].toUpperCase()}
            </p>
          </div>

          {/* 4. Last Scan & Verification Time */}
          <div className="p-3.5 rounded-xl bg-[var(--erp-card-subtle)] border border-[var(--erp-border)] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--erp-text-faint)]">
                Last Heartbeat Check
              </span>
              <Clock className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-sm font-bold font-mono text-[var(--erp-text-main)] tabular-nums">
              {liveSeenText}
            </p>
            <p className="text-[10px] text-[var(--erp-text-muted)]">
              Gateway: DTM-ESP32-01 ({currentVenue})
            </p>
          </div>
        </div>
      </div>

      {/* Main Attendance Card & Today's Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Attendance Card with Circular Gauge */}
        <div className="p-6 rounded-2xl erp-card shadow-md flex flex-col items-center justify-center text-center">
          <CircularProgress
            percentage={student.attendancePercentage}
            size={190}
            strokeWidth={15}
            label="CUMULATIVE"
            sublabel="Term Total"
          />

          {/* Breakdown: Present, Absent, Total */}
          <div className="grid grid-cols-3 gap-2 w-full mt-6 pt-5 border-t border-[var(--erp-border)] text-center">
            <div className="p-2.5 rounded-xl bg-[var(--erp-card-subtle)] border border-[var(--erp-border)]">
              <span className="text-[11px] font-semibold text-emerald-500 uppercase">Present</span>
              <p className="text-xl font-extrabold text-[var(--erp-text-main)] font-mono tabular-nums mt-0.5">{student.presentClasses}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[var(--erp-card-subtle)] border border-[var(--erp-border)]">
              <span className="text-[11px] font-semibold text-rose-500 uppercase">Absent</span>
              <p className="text-xl font-extrabold text-[var(--erp-text-main)] font-mono tabular-nums mt-0.5">{student.absentClasses}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[var(--erp-card-subtle)] border border-[var(--erp-border)]">
              <span className="text-[11px] font-semibold text-[var(--erp-text-muted)] uppercase">Total</span>
              <p className="text-xl font-extrabold text-[var(--erp-text-main)] font-mono tabular-nums mt-0.5">{student.totalClasses}</p>
            </div>
          </div>
        </div>

        {/* Today's Attendance Card */}
        <div className="lg:col-span-2 p-6 rounded-2xl erp-card shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[var(--erp-border)]">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">
                  CURRENT CLASS SESSION
                </span>
                <h3 className="text-xl font-extrabold text-[var(--erp-text-main)] mt-0.5">
                  {currentClass.currentSubject}
                </h3>
                <div className="flex items-center gap-2 text-xs font-mono text-[var(--erp-text-muted)] mt-1">
                  <span>{currentClass.subjectCode}</span>
                  <span>&bull;</span>
                  <span>{currentClass.periodLabel}</span>
                  <span>&bull;</span>
                  <span>{currentClass.room}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                    currentClass.attendanceMode === 'ACTIVE'
                      ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                  }`}
                >
                  {currentClass.statusMessage}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-5">
              {/* RFID Card Status */}
              <div className="p-4 rounded-xl bg-[var(--erp-card-subtle)] border border-[var(--erp-border)] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--erp-text-muted)] font-semibold">RFID Tag</span>
                  <Radio className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-sm font-bold text-[var(--erp-text-main)]">
                  {todayRecord?.rfidStatus === 'VERIFIED' ? 'Verified' : todayRecord?.rfidStatus || 'Pending'}
                </p>
                <p className="text-[11px] font-mono text-emerald-500 truncate">
                  UID: {student.rfidUid}
                </p>
              </div>

              {/* BLE Status - Live dynamic */}
              <div
                className={`p-4 rounded-xl border space-y-1 transition-all ${
                  liveBluetoothPresent
                    ? 'bg-[var(--erp-card-subtle)] border-emerald-500/30'
                    : 'bg-[var(--erp-card-subtle)] border-[var(--erp-border)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--erp-text-muted)] font-semibold">BLE Proximity</span>
                  <Wifi
                    className={`w-4 h-4 ${
                      liveBluetoothPresent
                        ? 'text-emerald-500 animate-pulse'
                        : 'text-rose-500'
                    }`}
                  />
                </div>
                <p
                  className={`text-sm font-bold ${
                    liveBluetoothPresent ? 'text-emerald-500' : 'text-rose-500'
                  }`}
                >
                  {liveBluetoothPresent ? 'Detected (Live)' : 'Absent'}
                </p>
                <p className="text-[11px] font-mono text-teal-500 tabular-nums">
                  {liveRssi} dBm (RSSI)
                </p>
                <p className="text-[10px] text-[var(--erp-text-muted)] font-mono truncate">
                  {liveSeenText}
                </p>
              </div>

              {/* Entry Time */}
              <div className="p-4 rounded-xl bg-[var(--erp-card-subtle)] border border-[var(--erp-border)] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--erp-text-muted)] font-semibold">Entry Time</span>
                  <Clock className="w-4 h-4 text-teal-500" />
                </div>
                <p className="text-sm font-bold text-[var(--erp-text-main)] font-mono tabular-nums">
                  {todayRecord?.time || '10:42:31 AM'}
                </p>
                <p className="text-[11px] text-[var(--erp-text-muted)]">{currentVenue}</p>
              </div>

              {/* Final Status */}
              <div className="p-4 rounded-xl bg-[var(--erp-card-subtle)] border border-[var(--erp-border)] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--erp-text-muted)] font-semibold">Final Status</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <StatusBadge
                    type="final"
                    status={
                      todayRecord?.manualOverride
                        ? todayRecord.finalStatus
                        : liveBluetoothPresent && todayRecord?.rfidStatus === 'VERIFIED'
                        ? 'PRESENT'
                        : todayRecord?.finalStatus || 'PENDING'
                    }
                    size="md"
                  />
                </div>
                <p className="text-[10px] text-[var(--erp-text-muted)] mt-1">
                  {todayRecord?.manualOverride
                    ? 'Faculty Verified'
                    : liveBluetoothPresent
                    ? 'Dual Verified (Live)'
                    : 'Awaiting BLE Heartbeat'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[var(--erp-border)] flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--erp-text-muted)]">
            <span>Subject: <strong className="text-[var(--erp-text-main)]">Digital Technology &amp; Management</strong> (10:00 AM &ndash; 11:30 AM)</span>
            <span className="text-emerald-500 font-semibold">Faculty: Prof. K. Sundaram</span>
          </div>
        </div>
      </div>

      {/* Attendance Performance Chart */}
      <StudentWeeklyChart studentName={student.name} />

      {/* RECENT ATTENDANCE TABLE */}
      <div className="rounded-2xl border border-[var(--erp-border)] erp-card shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-[var(--erp-card-subtle)] border-b border-[var(--erp-border)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-bold text-[var(--erp-text-main)] tracking-tight">
              Biometric Attendance Session History
            </h3>
          </div>
          <span className="text-xs text-[var(--erp-text-muted)] font-mono">
            {records.length} Recorded Sessions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs erp-table" id="student-recent-attendance-table">
            <thead className="bg-[var(--erp-card-subtle)] text-[var(--erp-text-muted)] uppercase tracking-wider font-bold border-b border-[var(--erp-border)] text-[11px]">
              <tr>
                <th className="px-5 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Subject / Course</th>
                <th className="px-3 py-3 text-center">Period</th>
                <th className="px-4 py-3 font-mono text-center">Scan Time</th>
                <th className="px-3 py-3 text-center">RFID Status</th>
                <th className="px-3 py-3 text-center">BLE Status</th>
                <th className="px-5 py-3 text-right">Final Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--erp-border)]">
              {records.map((record) => (
                <tr
                  key={record.attendanceId || record.id}
                  className="hover:bg-[var(--erp-card-hover)] transition-colors"
                >
                  <td className="px-5 py-3.5 font-medium text-[var(--erp-text-main)] text-left">
                    {formatDisplayDate(record.date)}
                  </td>
                  <td className="px-4 py-3.5 text-left">
                    <p className="font-bold text-[var(--erp-text-main)]">{record.subject}</p>
                    <p className="text-[10px] font-mono text-[var(--erp-text-muted)]">{record.subjectCode}</p>
                  </td>
                  <td className="px-3 py-3.5 font-mono text-[var(--erp-text-main)] font-bold text-center">
                    P{record.period}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[var(--erp-text-main)] text-center tabular-nums">
                    {record.time || record.entryTime || '—'}
                  </td>
                  <td className="px-3 py-3.5 text-center">
                    <div className="inline-flex justify-center">
                      <StatusBadge type="rfid" status={record.rfidStatus} size="sm" />
                    </div>
                  </td>
                  <td className="px-3 py-3.5 text-center">
                    <div className="inline-flex justify-center">
                      <StatusBadge type="ble" status={record.bleStatus} size="sm" />
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="inline-flex justify-end">
                      <StatusBadge type="final" status={record.finalStatus} size="sm" />
                    </div>
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
