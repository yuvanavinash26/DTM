import React, { useState, useEffect } from 'react';
import { Student } from '../types/student';
import { AttendanceRecord, AttendanceStats, WeeklyAttendancePoint } from '../types/attendance';
import { getAllStudents } from '../services/studentService';
import {
  getAttendance,
  getAttendanceStatistics,
  getWeeklyAttendance,
} from '../services/attendanceService';
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
} from 'lucide-react';

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
  const [lastScanPulse, setLastScanPulse] = useState(false);

  // Polls Flask backend at http://localhost:8000/api/attendance every 2 seconds
  const flaskState = useFlaskAttendance(2000);

  const loadData = async () => {
    const [allStudents, allAttendance, statistics, weekly] = await Promise.all([
      getAllStudents(),
      getAttendance('2026-09-14'),
      getAttendanceStatistics(),
      getWeeklyAttendance(),
    ]);

    setStudents(allStudents);
    setTodayRecords(allAttendance);
    setStats(statistics);
    setWeeklyData(weekly);

    // Pulse the live card
    setLastScanPulse(true);
    setTimeout(() => setLastScanPulse(false), 1200);
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
      {/* Header / Sub-nav bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-white">
              Classroom Monitoring &amp; Live Feed
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Hall C-304
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Subject: Digital Technology &amp; Management &bull; 14 Sep 2026
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">
            Last Heartbeat: <strong className="text-white">{device.lastHeartbeat}</strong>
          </span>
        </div>
      </div>

      {/* Real-time Flask Backend Connection Bar */}
      <BackendStatusBar />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Students */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Enrolled
            </span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-white mt-1">{stats?.totalStudents || 2}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Section CSE-A</p>
        </div>

        {/* Present Today */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Present Today
            </span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-1">{stats?.presentToday || 0}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Verified in seat</p>
        </div>

        {/* Absent Today */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Absent Today
            </span>
            <UserX className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-black text-rose-400 mt-1">{stats?.absentToday || 0}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Unverified</p>
        </div>

        {/* Attendance Rate */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Attendance Rate
            </span>
            <Percent className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-white mt-1">{stats?.attendanceRate || 100}%</p>
          <p className="text-[11px] text-emerald-400 mt-0.5">Above 75% goal</p>
        </div>

        {/* RFID Verified */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              RFID Scans
            </span>
            <Radio className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-1">{stats?.rfidVerifiedCount || 0}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Cards registered</p>
        </div>

        {/* BLE Verified */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              BLE Verified
            </span>
            <Wifi className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-cyan-400 mt-1">{stats?.bleVerifiedCount || 0}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Proximity validated</p>
        </div>
      </div>

      {/* SECTION A: Large Live Classroom Status Card & SECTION F: Controller */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Live Classroom Status Card */}
        <div
          id="live-classroom-card"
          className={`p-5 rounded-2xl bg-slate-900/95 border transition-all duration-500 shadow-xl ${
            lastScanPulse
              ? 'border-emerald-500/70 shadow-emerald-950/40 ring-2 ring-emerald-500/20'
              : 'border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-800/80">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-400">
                CLASSROOM STATUS
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <h3 className="text-lg font-black text-white">LIVE MONITORING</h3>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              SESSION ACTIVE
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3.5 mt-4">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">ESP32 DEVICE</span>
              <p className="text-sm font-bold text-emerald-400 mt-0.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Connected
              </p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">DTM-ESP32-01</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">RFID READER</span>
              <p className="text-sm font-bold text-emerald-400 mt-0.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Online
              </p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">RC522 (13.56 MHz)</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">BLE VERIFICATION</span>
              {flaskState.isConnected && flaskState.lastData ? (
                <>
                  <p
                    className={`text-sm font-bold mt-0.5 flex items-center gap-1.5 ${
                      flaskState.lastData.bluetooth === 'PRESENT'
                        ? 'text-emerald-400'
                        : 'text-rose-400'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        flaskState.lastData.bluetooth === 'PRESENT'
                          ? 'bg-emerald-400'
                          : 'bg-rose-400'
                      }`}
                    ></span>
                    {flaskState.lastData.bluetooth === 'PRESENT' ? 'PRESENT' : 'ABSENT'}
                  </p>
                  <p className="text-[10px] text-cyan-300 font-mono mt-0.5">
                    {flaskState.lastData.rssi !== null && flaskState.lastData.rssi !== undefined
                      ? `${flaskState.lastData.rssi} dBm`
                      : 'No Proximity Signal'}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-bold text-amber-400 mt-0.5 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    Waiting for Flask
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">:8000 Offline</p>
                </>
              )}
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">LAST SEEN</span>
              <p className="text-sm font-bold text-white mt-0.5 font-mono">
                {flaskState.lastSeenFormatted || device.lastScanTime || '10:42:31 AM'}
              </p>
              <p className="text-[10px] text-indigo-300 font-mono truncate mt-0.5">
                {flaskState.lastData?.student || device.lastStudentName || 'Yuvan Avinash'}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Dual-Factor Verification Protocol</span>
            <span className="text-emerald-400 font-medium">99.8% Accuracy Rate</span>
          </div>
        </div>

        {/* SECTION F: Embedded Classroom Device Simulator */}
        <div className="lg:col-span-2">
          <DeviceController onEventTriggered={loadData} />
        </div>
      </div>

      {/* SECTION B: LIVE ATTENDANCE FEED */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden backdrop-blur-sm">
        <div className="px-5 py-3.5 bg-slate-950/70 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Live Attendance Feed
            </h3>
            <span className="text-xs text-slate-400">Real-time gateway stream</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Active Records: {todayRecords.length}
          </span>
        </div>

        <div className="divide-y divide-slate-800/80 overflow-x-auto">
          {todayRecords.map((record) => (
            <div
              key={record.attendanceId}
              id={`feed-row-${record.studentId}`}
              className="px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold text-white shrink-0">
                  {record.studentName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white truncate">
                      {record.studentName}
                    </span>
                    <span className="text-xs font-mono text-slate-400 shrink-0">
                      {record.studentId}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                    <span>Card: <code className="text-indigo-300 font-mono">{record.rfidUid}</code></span>
                    {record.rssi !== undefined && (
                      <span className="font-mono text-cyan-300">{record.rssi} dBm</span>
                    )}
                    {record.manualOverride && (
                      <span className="text-purple-400 font-medium">
                        (Manually marked: {record.reason})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Badges & Time */}
              <div className="flex items-center gap-3 shrink-0">
                <StatusBadge type="rfid" status={record.rfidStatus} size="sm" />
                <StatusBadge type="ble" status={record.bleStatus} size="sm" />
                <StatusBadge type="final" status={record.finalStatus} size="sm" />
                <span className="text-xs font-mono font-medium text-slate-300 w-18 text-right">
                  {record.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION C: STUDENT ATTENDANCE TABLE */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden backdrop-blur-sm">
        <div className="px-5 py-3.5 bg-slate-950/70 border-b border-slate-800/80 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Class Roster &amp; Verification Status
            </h3>
            <p className="text-xs text-slate-400">Classroom C-304 &bull; Semester V &bull; Section A</p>
          </div>
          <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
            {students.length} Registered Students
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs" id="student-attendance-table">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="px-5 py-3">Student</th>
                <th className="px-4 py-3 font-mono">Student ID</th>
                <th className="px-4 py-3">RFID</th>
                <th className="px-4 py-3">BLE</th>
                <th className="px-4 py-3">Entry Time</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Attendance %</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
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
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-white">{student.name}</p>
                          <p className="text-[11px] text-slate-400">{student.department}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-300">
                      {student.studentId}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge type="rfid" status={rfidStat} size="sm" />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col items-start gap-0.5">
                        <StatusBadge type="ble" status={bleStat} size="sm" />
                        {todayRec?.rssi !== undefined && (
                          <span className="text-[10px] font-mono text-cyan-300">
                            {todayRec.rssi} dBm
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-300">
                      {entryTime}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge type="final" status={finalStat} size="sm" />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold font-mono text-white">
                          {student.attendancePercentage}%
                        </span>
                        <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
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
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                        <button
                          type="button"
                          id={`btn-mark-${student.studentId}`}
                          onClick={() => handleOpenOverride(student)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-sm transition-colors flex items-center gap-1"
                        >
                          <span>Mark Attendance</span>
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
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
              BLE Proximity Notice
            </h4>
          </div>
          <p className="text-xs text-amber-200/90 leading-relaxed">
            Krishothaman (RA2511003020043) RFID detected, but BLE RSSI dropped below threshold. Resolved via manual teacher verification.
          </p>
        </div>

        {/* Alert 2: Attendance threshold alert */}
        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-200 space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-300">
              Department Regulation
            </h4>
          </div>
          <p className="text-xs text-blue-200/90 leading-relaxed">
            All students are presently above the 75% mandatory university eligibility criteria for End-Semester examinations.
          </p>
        </div>

        {/* Alert 3: Device Health */}
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 space-y-2">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Gateway Node Health
            </h4>
          </div>
          <p className="text-xs text-emerald-200/90 leading-relaxed">
            ESP32 gateway DTM-ESP32-01 online with zero packet loss across SPI RC522 bus and BLE beacon scanner.
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
    </div>
  );
};
