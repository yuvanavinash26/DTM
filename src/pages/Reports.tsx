import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { AttendanceStats, AttendanceRecord } from '../../src/types/attendance';
import { Student } from '../../src/types/student';
import { getAllStudents } from '../services/studentService';
import {
  getAttendance,
  getAttendanceStatistics,
  exportAttendanceCSV,
} from '../services/attendanceService';
import { getActiveVenue } from '../services/venueService';
import { formatDisplayDate } from '../utils/dateUtils';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Download,
  FileText,
  Edit3,
  CheckCircle2,
  FileSpreadsheet,
  Building2,
  ShieldCheck,
} from 'lucide-react';

export const Reports: React.FC = () => {
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [activeVenue, setActiveVenue] = useState<string>(getActiveVenue());

  useEffect(() => {
    const handleVenue = (e: any) => {
      if (e.detail) setActiveVenue(e.detail);
      else setActiveVenue(getActiveVenue());
    };
    window.addEventListener('dtm_venue_change', handleVenue);
    return () => window.removeEventListener('dtm_venue_change', handleVenue);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const [st, stds, recs] = await Promise.all([
        getAttendanceStatistics(),
        getAllStudents(),
        getAttendance(),
      ]);
      setStats(st);
      setStudents(stds);
      setRecords(recs);
    };
    fetchData();
  }, []);

  const pieData = [
    { name: 'RFID + BLE Dual Verified', value: 16, color: '#10b981' },
    { name: 'Manual Override', value: stats?.manualOverrideCount || 2, color: '#f59e0b' },
    { name: 'Unverified / Absent', value: 2, color: '#ef4444' },
  ];

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-12"
      id="reports-view"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Building2 className="w-3 h-3" />
              Academic Audit Division
            </span>
            <span className="text-xs text-slate-400">&bull;</span>
            <span className="text-xs text-slate-400 font-medium">B.Tech Computer Science and Engineering &bull; Section CSE-A &bull; {activeVenue}</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Classroom Attendance Analytics &amp; Reports
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Institutional biometric compliance audits, RFID/BLE telemetry ratio, and official grade eligibility metrics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="btn-export-csv"
            onClick={exportAttendanceCSV}
            className="erp-btn inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-white/10 text-xs font-semibold shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            id="btn-export-report"
            onClick={handlePrintReport}
            className="erp-btn inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950/40"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Print Official Dossier</span>
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="erp-card-interactive p-4 rounded-2xl">
          <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            Overall Attendance
          </span>
          <p className="text-2xl font-extrabold text-white mt-1 tabular-nums">92.1%</p>
          <p className="text-[11px] text-emerald-400 mt-0.5 font-medium">&uarr; +2.4% above institutional threshold</p>
        </div>

        <div className="erp-card-interactive p-4 rounded-2xl">
          <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            RFID Card Scans
          </span>
          <p className="text-2xl font-extrabold text-emerald-400 mt-1 tabular-nums">94.7%</p>
          <p className="text-[11px] text-slate-400 mt-0.5">18 / 19 sessions verified</p>
        </div>

        <div className="erp-card-interactive p-4 rounded-2xl">
          <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            BLE Proximity Rate
          </span>
          <p className="text-2xl font-extrabold text-teal-400 mt-1 tabular-nums">89.5%</p>
          <p className="text-[11px] text-slate-400 mt-0.5">17 / 19 sessions verified</p>
        </div>

        <div className="erp-card-interactive p-4 rounded-2xl">
          <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            Faculty Overrides
          </span>
          <p className="text-2xl font-extrabold text-amber-400 mt-1 tabular-nums">
            {stats?.manualOverrideCount || 2}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Audited by Class In-Charge</p>
        </div>
      </div>

      {/* Charts & Roster Comparison Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Verification Breakdown Pie */}
        <div className="erp-card p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Biometric Pipeline Distribution
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Breakdown of active validation modes</p>
          </div>

          <div className="h-52 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={78}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0b0f19',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-3 border-t border-white/5 text-xs">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-300 font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-white font-mono tabular-nums">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Student-wise Attendance Comparison */}
        <div className="lg:col-span-2 erp-card p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Student-wise Performance Benchmark
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Semester III (2nd Year) lecture participation summary</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              Exam Hall-Ticket Ready
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs erp-table">
              <thead className="bg-slate-950/60 text-slate-400 uppercase text-[11px] font-bold border-b border-white/10">
                <tr>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-3 py-3 font-mono text-center">Register No</th>
                  <th className="px-3 py-3 font-mono text-center">RFID UID</th>
                  <th className="px-3 py-3 text-center">Present</th>
                  <th className="px-3 py-3 text-center">Absent</th>
                  <th className="px-3 py-3 text-center">Attendance %</th>
                  <th className="px-4 py-3 text-right">Eligibility</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {students.map((std) => (
                  <tr key={std.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 font-semibold text-white">{std.name}</td>
                    <td className="px-3 py-3 font-mono text-slate-300 text-center">{std.studentId}</td>
                    <td className="px-3 py-3 font-mono text-teal-400 text-center">{std.rfidUid}</td>
                    <td className="px-3 py-3 font-bold text-emerald-400 text-center tabular-nums">{std.presentClasses}</td>
                    <td className="px-3 py-3 font-bold text-rose-400 text-center tabular-nums">{std.absentClasses}</td>
                    <td className="px-3 py-3 font-bold font-mono text-white text-center tabular-nums">
                      {std.attendancePercentage}%
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        ELIGIBLE
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Faculty Audit & Hardware Incident Log */}
      <div className="erp-card p-5 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">
              Faculty Audit &amp; Hardware Incident Log
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {records.filter((r) => r.manualOverride).length} Incidents Recorded
          </span>
        </div>

        <div className="space-y-2">
          {records
            .filter((r) => r.manualOverride)
            .map((rec) => (
              <div
                key={rec.attendanceId}
                className="p-3.5 rounded-xl bg-slate-950/40 border border-white/5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{rec.studentName}</span>
                    <span className="text-slate-400 font-mono text-[11px]">({rec.studentId})</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/25">
                      {rec.reason}
                    </span>
                    <span className="text-slate-400">&bull; {formatDisplayDate(rec.date)}</span>
                  </div>
                  {rec.note && <p className="text-slate-400 mt-1 italic">"{rec.note}"</p>}
                </div>
                <div className="text-right text-[11px] text-slate-400 font-mono shrink-0">
                  Audit Signed By: <strong className="text-white">{rec.teacherName || 'Class Teacher'}</strong>
                </div>
              </div>
            ))}
        </div>
      </div>
    </motion.div>
  );
};
