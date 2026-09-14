import React, { useState, useEffect } from 'react';
import { Student } from '../types/student';
import { AttendanceRecord, AttendanceStats, WeeklyAttendancePoint } from '../types/attendance';
import { getAllStudents } from '../services/studentService';
import {
  getAttendance,
  getAttendanceStatistics,
  getWeeklyTrends,
} from '../services/attendanceService';
import { getCurrentClass, setClassroomSimulation } from '../services/timetableService';
import { SimulatedClassroomOverride } from '../utils/timeUtils';
import { getDeviceStatus } from '../services/deviceService';
import { StatusBadge } from '../components/ui/StatusBadge';
import { AttendanceOverviewChart } from '../components/charts/AttendanceOverviewChart';
import { DeviceController } from '../components/devices/DeviceController';
import { ManualAttendanceModal } from '../components/attendance/ManualAttendanceModal';
import { BackendStatusBar } from '../components/backend/BackendStatusBar';
import { useFlaskAttendance } from '../hooks/useFlaskAttendance';
import {
  Users,
  UserCheck,
  UserX,
  Percent,
  Radio,
  Wifi,
  AlertTriangle,
  Eye,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ChevronRight,
  Sparkles,
  MapPin,
} from 'lucide-react';
import { getActiveVenue } from '../services/venueService';
import { VenueChangeModal } from '../components/venue/VenueChangeModal';

interface TeacherDashboardProps {
  onViewStudent: (student: Student) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onViewStudent }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [todayRecords, setTodayRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyAttendancePoint[]>([]);
  const [selectedStudentForOverride, setSelectedStudentForOverride] = useState<Student | null>(null);
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [activeVenue, setActiveVenueState] = useState(getActiveVenue());
  const [isVenueModalOpen, setIsVenueModalOpen] = useState(false);

  useEffect(() => {
    const handleVenue = () => setActiveVenueState(getActiveVenue());
    window.addEventListener('dtm_venue_change', handleVenue);
    return () => window.removeEventListener('dtm_venue_change', handleVenue);
  }, []);
  const [currentClass, setCurrentClass] = useState(getCurrentClass());
  const [lastScanPulse, setLastScanPulse] = useState(false);

  // Polls Flask backend at http://localhost:8000/api/attendance every 2 seconds
  const flaskState = useFlaskAttendance(2000);

  const loadData = async () => {
    const [allStudents, allAttendance, statistics, weekly] = await Promise.all([
      getAllStudents(),
      getAttendance('2026-09-14'),
      getAttendanceStatistics(),
      getWeeklyTrends(),
    ]);

    setStudents(allStudents);
    setTodayRecords(allAttendance);
    setStats(statistics);
    setWeeklyData(weekly);
    setCurrentClass(getCurrentClass());

    // Pulse the live card
    setLastScanPulse(true);
    setTimeout(() => setLastScanPulse(false), 1200);
  };

  const handleSimulate = (override: SimulatedClassroomOverride | null) => {
    setClassroomSimulation(override);
    setCurrentClass(getCurrentClass());
    loadData();
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      loadData();
    };

    window.addEventListener('dtm_attendance_update', handleUpdate);
    window.addEventListener('dtm_device_update', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('dtm_attendance_update', handleUpdate);
      window.removeEventListener('dtm_device_update', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const handleOpenOverride = (student: Student) => {
    setSelectedStudentForOverride(student);
    setIsOverrideModalOpen(true);
  };

  const device = getDeviceStatus();

  return (
    <div className="space-y-6 pb-12" id="teacher-dashboard-view">
      {/* ================================================== */}
      {/* CURRENT CLASSROOM MONITOR (Academic Timetable Engine) */}
      {/* ================================================== */}
      <div
        id="current-classroom-monitor"
        className={`p-6 rounded-2xl border transition-all duration-300 shadow-lg relative overflow-hidden erp-card ${
          currentClass.attendanceMode === 'ACTIVE'
            ? 'border-emerald-500/40 bg-[var(--erp-card)]'
            : currentClass.attendanceMode === 'PAUSED'
            ? 'border-amber-500/40 bg-[var(--erp-card)]'
            : 'border-[var(--erp-border)] bg-[var(--erp-card)]'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Day, Time & Attendance Mode */}
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--erp-text-muted)] font-mono">
                {currentClass.currentDay} &bull; {currentClass.currentDate}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold tracking-wide ${
                  currentClass.attendanceMode === 'ACTIVE'
                    ? 'bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 border border-emerald-500/30'
                    : currentClass.attendanceMode === 'PAUSED'
                    ? 'bg-amber-500/15 text-amber-500 dark:text-amber-300 border border-amber-500/30'
                    : 'bg-[var(--erp-card-subtle)] text-[var(--erp-text-muted)] border border-[var(--erp-border)]'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    currentClass.attendanceMode === 'ACTIVE'
                      ? 'bg-emerald-400 animate-pulse'
                      : currentClass.attendanceMode === 'PAUSED'
                      ? 'bg-amber-400'
                      : 'bg-slate-400'
                  }`}
                />
                {currentClass.statusMessage}
              </span>
            </div>

            <div className="text-4xl sm:text-5xl font-black tracking-tight text-[var(--erp-text-main)] font-mono pt-1">
              {currentClass.currentTime}
            </div>

            <p className="text-xs text-[var(--erp-text-muted)] font-medium pt-1">
              Indian Standard Time (Asia/Kolkata) &bull; Verified Biometric Gateway C-304
            </p>
          </div>

          {/* Center: Current Period, Subject, Subject Code & Remaining Time */}
          <div className="p-4 rounded-xl bg-[var(--erp-card-subtle)] border border-[var(--erp-border)] flex-1 max-w-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--erp-text-faint)]">
                {currentClass.periodLabel}
              </span>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {currentClass.timeRemainingText}
              </span>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-[var(--erp-text-main)] tracking-tight leading-snug">
                {currentClass.currentSubject}
              </h3>
              <div className="flex flex-wrap items-center gap-2.5 text-xs text-[var(--erp-text-muted)] mt-1.5 font-mono">
                <span>Code: <strong className="text-[var(--erp-text-main)] font-semibold">{currentClass.subjectCode}</strong></span>
                <span>&bull;</span>
                <span className="flex items-center gap-1.5">
                  Venue: <strong className="text-emerald-500 font-bold">{activeVenue}</strong>
                  <button
                    type="button"
                    id="btn-edit-venue-quick"
                    onClick={() => setIsVenueModalOpen(true)}
                    className="px-2 py-0.5 rounded bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-500 text-[10px] font-bold border border-emerald-500/30 erp-btn inline-flex items-center gap-1"
                    title="Change classroom venue"
                  >
                    <MapPin className="w-2.5 h-2.5" />
                    <span>Change Room</span>
                  </button>
                </span>
                <span>&bull;</span>
                <span>Schedule: {currentClass.startTime} &ndash; {currentClass.endTime}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Timetable Engine & Simulation Jumps */}
        <div className="mt-5 pt-4 border-t border-[var(--erp-border)] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[var(--erp-text-muted)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="font-bold uppercase tracking-wider text-[11px] text-[var(--erp-text-main)]">
              Timetable Simulation:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              id="sim-live-clock"
              onClick={() => handleSimulate(null)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all erp-btn text-xs ${
                !currentClass.isSimulated
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-[var(--erp-card-subtle)] hover:bg-[var(--erp-card-hover)] text-[var(--erp-text-muted)] border border-[var(--erp-border)]'
              }`}
            >
              Real-time IST Clock
            </button>
            <button
              type="button"
              id="sim-period-7"
              onClick={() => handleSimulate({ enabled: true, day: 'Monday', period: 7, minutesIntoClass: 16 })}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all erp-btn text-xs ${
                currentClass.isSimulated && currentClass.currentPeriod === 7
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-[var(--erp-card-subtle)] hover:bg-[var(--erp-card-hover)] text-[var(--erp-text-muted)] border border-[var(--erp-border)]'
              }`}
            >
              Monday P7 (Active: Adv Programming)
            </button>
            <button
              type="button"
              id="sim-break"
              onClick={() => handleSimulate({ enabled: true, day: 'Monday', period: 0, minutesIntoClass: 5 })}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all erp-btn text-xs ${
                currentClass.isSimulated && currentClass.reason === 'BREAK'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-[var(--erp-card-subtle)] hover:bg-[var(--erp-card-hover)] text-[var(--erp-text-muted)] border border-[var(--erp-border)]'
              }`}
            >
              Morning Break (Paused)
            </button>
            <button
              type="button"
              id="sim-lunch"
              onClick={() => handleSimulate({ enabled: true, day: 'Monday', period: -1, minutesIntoClass: 20 })}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all erp-btn text-xs ${
                currentClass.isSimulated && currentClass.reason === 'LUNCH'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-[var(--erp-card-subtle)] hover:bg-[var(--erp-card-hover)] text-[var(--erp-text-muted)] border border-[var(--erp-border)]'
              }`}
            >
              Lunch Break (Paused)
            </button>
            <button
              type="button"
              id="sim-no-class"
              onClick={() => handleSimulate({ enabled: true, day: 'Wednesday', period: 5, minutesIntoClass: 10 })}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all erp-btn text-xs ${
                currentClass.isSimulated && currentClass.reason === 'NO_CLASS'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-[var(--erp-card-subtle)] hover:bg-[var(--erp-card-hover)] text-[var(--erp-text-muted)] border border-[var(--erp-border)]'
              }`}
            >
              Wed P5 (Inactive)
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Flask Backend Connection Bar */}
      <BackendStatusBar />

      {/* Summary KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Students */}
        <div className="p-4 rounded-xl erp-card-interactive shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[var(--erp-text-muted)] uppercase tracking-wider">
              Enrolled
            </span>
            <Users className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-[var(--erp-text-main)] font-mono tabular-nums mt-1">{stats?.totalStudents || 2}</p>
          <p className="text-[11px] text-[var(--erp-text-muted)] mt-0.5 font-medium">Section CSE-A</p>
        </div>

        {/* Present Today */}
        <div className="p-4 rounded-xl erp-card-interactive shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[var(--erp-text-muted)] uppercase tracking-wider">
              Present Today
            </span>
            <UserCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-500 font-mono tabular-nums mt-1">{stats?.presentToday || 0}</p>
          <p className="text-[11px] text-[var(--erp-text-muted)] mt-0.5 font-medium">Verified in Hall</p>
        </div>

        {/* Absent Today */}
        <div className="p-4 rounded-xl erp-card-interactive shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[var(--erp-text-muted)] uppercase tracking-wider">
              Absent Today
            </span>
            <UserX className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-500 font-mono tabular-nums mt-1">{stats?.absentToday || 0}</p>
          <p className="text-[11px] text-[var(--erp-text-muted)] mt-0.5 font-medium">Unverified Roll</p>
        </div>

        {/* Attendance Rate */}
        <div className="p-4 rounded-xl erp-card-interactive shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[var(--erp-text-muted)] uppercase tracking-wider">
              Attendance %
            </span>
            <Percent className="w-4 h-4 text-teal-500" />
          </div>
          <p className="text-2xl font-black text-[var(--erp-text-main)] font-mono tabular-nums mt-1">{stats?.attendanceRate || 100}%</p>
          <p className="text-[11px] text-emerald-500 mt-0.5 font-medium">&gt;= 75% University Goal</p>
        </div>

        {/* RFID Verified */}
        <div className="p-4 rounded-xl erp-card-interactive shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[var(--erp-text-muted)] uppercase tracking-wider">
              RFID Scans
            </span>
            <Radio className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-500 font-mono tabular-nums mt-1">{stats?.rfidVerifiedCount || 0}</p>
          <p className="text-[11px] text-[var(--erp-text-muted)] mt-0.5 font-medium">Cards Authenticated</p>
        </div>

        {/* BLE Verified */}
        <div className="p-4 rounded-xl erp-card-interactive shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[var(--erp-text-muted)] uppercase tracking-wider">
              BLE Verified
            </span>
            <Wifi className="w-4 h-4 text-teal-500" />
          </div>
          <p className="text-2xl font-black text-teal-500 font-mono tabular-nums mt-1">{stats?.bleVerifiedCount || 0}</p>
          <p className="text-[11px] text-[var(--erp-text-muted)] mt-0.5 font-medium">Proximity Validated</p>
        </div>
      </div>

      {/* SECTION A: Large Live Classroom Status Card & SECTION F: Controller */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Live Classroom Status Card */}
        <div
          id="live-classroom-card"
          className={`p-5 rounded-2xl border transition-all duration-300 shadow-md erp-card ${
            lastScanPulse
              ? 'border-emerald-500/70 ring-2 ring-emerald-500/20'
              : 'border-[var(--erp-border)]'
          }`}
        >
          <div className="flex items-center justify-between pb-3.5 border-b border-[var(--erp-border)]">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-500">
                CAMPUS HARDWARE MONITOR
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <h3 className="text-base font-extrabold text-[var(--erp-text-main)]">BIOMETRIC GATEWAY</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-md text-xs font-bold font-mono bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              GATEWAY ONLINE
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
            <div className="p-3 rounded-xl bg-[var(--erp-card-subtle)] border border-[var(--erp-border)]">
              <span className="text-[10px] text-[var(--erp-text-faint)] uppercase font-bold tracking-wider">ESP32 CONTROLLER</span>
              <p className="text-xs font-bold text-emerald-500 mt-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Connected
              </p>
              <p className="text-[10px] text-[var(--erp-text-muted)] font-mono mt-0.5">DTM-ESP32-01</p>
            </div>

            <div className="p-3 rounded-xl bg-[var(--erp-card-subtle)] border border-[var(--erp-border)]">
              <span className="text-[10px] text-[var(--erp-text-faint)] uppercase font-bold tracking-wider">RFID BUS</span>
              <p className="text-xs font-bold text-emerald-500 mt-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Active SPI
              </p>
              <p className="text-[10px] text-[var(--erp-text-muted)] font-mono mt-0.5">RC522 (13.56 MHz)</p>
            </div>

            <div className="p-3 rounded-xl bg-[var(--erp-card-subtle)] border border-[var(--erp-border)]">
              <span className="text-[10px] text-[var(--erp-text-faint)] uppercase font-bold tracking-wider">BLE SCANNER</span>
              {flaskState.isConnected && flaskState.lastData ? (
                <>
                  <p
                    className={`text-xs font-bold mt-1 flex items-center gap-1.5 ${
                      flaskState.lastData.bluetooth === 'PRESENT'
                        ? 'text-emerald-500'
                        : 'text-rose-500'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        flaskState.lastData.bluetooth === 'PRESENT'
                          ? 'bg-emerald-500'
                          : 'bg-rose-500'
                      }`}
                    />
                    {flaskState.lastData.bluetooth === 'PRESENT' ? 'BEACON IN-RANGE' : 'BEACON ABSENT'}
                  </p>
                  <p className="text-[10px] text-[var(--erp-text-muted)] font-mono mt-0.5">
                    {flaskState.lastData.rssi !== null && flaskState.lastData.rssi !== undefined
                      ? `${flaskState.lastData.rssi} dBm`
                      : 'No Proximity Signal'}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xs font-bold text-amber-500 mt-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Waiting for Backend
                  </p>
                  <p className="text-[10px] text-[var(--erp-text-muted)] font-mono mt-0.5">:8000 Polling</p>
                </>
              )}
            </div>

            <div className="p-3 rounded-xl bg-[var(--erp-card-subtle)] border border-[var(--erp-border)]">
              <span className="text-[10px] text-[var(--erp-text-faint)] uppercase font-bold tracking-wider">LAST EVENT</span>
              <p className="text-xs font-bold text-[var(--erp-text-main)] mt-1 font-mono tabular-nums">
                {flaskState.lastSeenFormatted || device.lastScanTime || '10:42:31 AM'}
              </p>
              <p className="text-[10px] text-[var(--erp-text-muted)] font-mono truncate mt-0.5">
                {flaskState.lastData?.student || device.lastStudentName || 'Yuvan Avinash'}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[var(--erp-border)] flex items-center justify-between text-xs text-[var(--erp-text-muted)]">
            <span>Dual-Factor Verification</span>
            <span className="text-emerald-500 font-semibold">99.8% Reliability</span>
          </div>
        </div>

        {/* SECTION F: Embedded Classroom Device Simulator */}
        <div className="lg:col-span-2">
          <DeviceController onEventTriggered={loadData} />
        </div>
      </div>

      {/* SECTION B: LIVE ATTENDANCE FEED */}
      <div className="rounded-2xl border border-[var(--erp-border)] erp-card shadow-lg overflow-hidden">
        <div className="px-5 py-3.5 bg-[var(--erp-card-subtle)] border-b border-[var(--erp-border)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-sm font-bold text-[var(--erp-text-main)] tracking-tight">
              Biometric Access Stream
            </h3>
            <span className="text-xs text-[var(--erp-text-muted)]">Real-time gateway events</span>
          </div>
          <span className="text-xs text-[var(--erp-text-muted)] font-mono">
            {todayRecords.length} Active Records Today
          </span>
        </div>

        <div className="divide-y divide-[var(--erp-border)] overflow-x-auto">
          {todayRecords.map((record) => (
            <div
              key={record.attendanceId}
              id={`feed-row-${record.studentId}`}
              className="px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[var(--erp-card-hover)] transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[var(--erp-card-subtle)] border border-[var(--erp-border)] flex items-center justify-center text-sm font-bold text-[var(--erp-text-main)] shrink-0">
                  {record.studentName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[var(--erp-text-main)] truncate">
                      {record.studentName}
                    </span>
                    <span className="text-xs font-mono text-[var(--erp-text-muted)] shrink-0">
                      {record.studentId}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[var(--erp-text-muted)] mt-0.5">
                    <span>Card: <code className="text-emerald-500 font-mono">{record.rfidUid}</code></span>
                    {record.rssi !== undefined && (
                      <span className="font-mono text-teal-500">{record.rssi} dBm</span>
                    )}
                    {record.manualOverride && (
                      <span className="text-purple-500 font-medium">
                        (Manual: {record.reason})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Badges & Time */}
              <div className="flex items-center gap-2.5 shrink-0">
                <StatusBadge type="rfid" status={record.rfidStatus} size="sm" />
                <StatusBadge type="ble" status={record.bleStatus} size="sm" />
                <StatusBadge type="final" status={record.finalStatus} size="sm" />
                <span className="text-xs font-mono font-medium text-[var(--erp-text-main)] w-20 text-right tabular-nums">
                  {record.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION C: STUDENT ATTENDANCE TABLE */}
      <div className="rounded-2xl border border-[var(--erp-border)] erp-card shadow-lg overflow-hidden">
        <div className="px-5 py-3.5 bg-[var(--erp-card-subtle)] border-b border-[var(--erp-border)] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[var(--erp-text-main)] tracking-tight">
              Class Roster &amp; Verification Status
            </h3>
            <p className="text-xs text-[var(--erp-text-muted)]">
              Classroom: {activeVenue} &bull; Semester III (2nd Year) &bull; Section CSE-A
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
            {students.length} Registered Students
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs erp-table" id="student-attendance-table">
            <thead className="bg-[var(--erp-card-subtle)] text-[var(--erp-text-muted)] uppercase tracking-wider font-bold border-b border-[var(--erp-border)] text-[11px]">
              <tr>
                <th className="px-5 py-3 text-left">Student</th>
                <th className="px-4 py-3 font-mono text-left">Roll Number</th>
                <th className="px-4 py-3 text-center">RFID Verification</th>
                <th className="px-4 py-3 text-center">BLE Proximity</th>
                <th className="px-4 py-3 font-mono text-center">Scan Time</th>
                <th className="px-4 py-3 text-center">Final Status</th>
                <th className="px-4 py-3 text-left">Term Attendance</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--erp-border)]">
              {students.map((student) => {
                const todayRec = todayRecords.find((r) => r.studentId === student.studentId);
                const rfidStat = todayRec?.rfidStatus || 'NOT_DETECTED';
                const bleStat = todayRec?.bleStatus || 'NOT_DETECTED';
                const finalStat = todayRec?.finalStatus || 'ABSENT';
                const entryTime = todayRec?.time || '—';

                return (
                  <tr
                    key={student.id}
                    id={`student-row-${student.studentId}`}
                    className="hover:bg-[var(--erp-card-hover)] transition-colors"
                  >
                    <td className="px-5 py-3.5 text-left">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[var(--erp-card-subtle)] border border-[var(--erp-border)] flex items-center justify-center font-bold text-[var(--erp-text-main)]">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-[var(--erp-text-main)]">{student.name}</p>
                          <p className="text-[11px] text-[var(--erp-text-muted)]">{student.department}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[var(--erp-text-main)] text-left tabular-nums">
                      {student.studentId}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="inline-flex justify-center">
                        <StatusBadge type="rfid" status={rfidStat} size="sm" />
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="inline-flex flex-col items-center gap-0.5">
                        <StatusBadge type="ble" status={bleStat} size="sm" />
                        {todayRec?.rssi !== undefined && (
                          <span className="text-[10px] font-mono text-teal-500 tabular-nums">
                            {todayRec.rssi} dBm
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[var(--erp-text-main)] text-center tabular-nums">
                      {entryTime}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="inline-flex justify-center">
                        <StatusBadge type="final" status={finalStat} size="sm" />
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-bold font-mono text-[var(--erp-text-main)] tabular-nums">
                          {student.attendancePercentage}%
                        </span>
                        <div className="w-16 h-1.5 rounded-full bg-[var(--erp-card-subtle)] overflow-hidden border border-[var(--erp-border)]">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${student.attendancePercentage}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          id={`btn-view-${student.studentId}`}
                          onClick={() => onViewStudent(student)}
                          className="px-2.5 py-1.5 rounded-lg bg-[var(--erp-card-subtle)] hover:bg-[var(--erp-card-hover)] border border-[var(--erp-border)] text-[var(--erp-text-main)] font-semibold transition-all erp-btn flex items-center gap-1 text-xs"
                        >
                          <Eye className="w-3.5 h-3.5 text-[var(--erp-text-muted)]" />
                          <span>Dossier</span>
                        </button>
                        <button
                          type="button"
                          id={`btn-mark-${student.studentId}`}
                          onClick={() => handleOpenOverride(student)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-sm transition-all erp-btn flex items-center gap-1 text-xs"
                        >
                          <span>Override</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION D: ATTENDANCE OVERVIEW CHARTS */}
      <AttendanceOverviewChart students={students} weeklyData={weeklyData} />

      {/* SECTION E: ABSENCE & VERIFICATION ALERTS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="verification-alerts-section">
        {/* Alert 1: BLE Warning */}
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-200 space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-300">
              Proximity Discrepancy Notice
            </h4>
          </div>
          <p className="text-xs text-amber-700 dark:text-amber-200/90 leading-relaxed">
            Krishothaman (RA2511003020043) RFID card swiped at 10:14 AM; BLE RSSI was below gateway boundary threshold. Resolved via faculty manual verification.
          </p>
        </div>

        {/* Alert 2: Attendance threshold alert */}
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-200 space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-300">
              Academic Regulation 75%
            </h4>
          </div>
          <p className="text-xs text-emerald-700 dark:text-emerald-200/90 leading-relaxed">
            All registered students in Section CSE-A currently satisfy the university statutory 75% minimum attendance requirement for End-Semester examinations.
          </p>
        </div>

        {/* Alert 3: Device Health */}
        <div className="p-4 rounded-xl bg-[var(--erp-card-subtle)] border border-[var(--erp-border)] space-y-2">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-500 shrink-0" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--erp-text-main)]">
              Gateway Node Status
            </h4>
          </div>
          <p className="text-xs text-[var(--erp-text-muted)] leading-relaxed">
            Hardware node DTM-ESP32-01 active with zero packet loss across SPI RC522 bus and continuous BLE beacon scan filter.
          </p>
        </div>
      </div>

      {/* Manual Override Modal */}
      {selectedStudentForOverride && (
        <ManualAttendanceModal
          student={selectedStudentForOverride}
          currentRecord={todayRecords.find(
            (r) => r.studentId === selectedStudentForOverride.studentId
          )}
          isOpen={isOverrideModalOpen}
          onClose={() => setIsOverrideModalOpen(false)}
          onSaved={loadData}
        />
      )}
      {/* Classroom Venue Switcher Modal for Class Teacher */}
      <VenueChangeModal
        isOpen={isVenueModalOpen}
        onClose={() => setIsVenueModalOpen(false)}
        onVenueChanged={(v) => setActiveVenueState(v)}
      />
    </div>
  );
};
