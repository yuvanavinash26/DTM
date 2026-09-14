import React, { useState, useEffect } from 'react';
import { AttendanceStats, AttendanceRecord } from '../../src/types/attendance';
import { Student } from '../../src/types/student';
import { getAllStudents } from '../services/studentService';
import {
  getAttendance,
  getAttendanceStatistics,
  exportAttendanceCSV,
} from '../services/attendanceService';
import { StatusBadge } from '../components/ui/StatusBadge';
import { formatDisplayDate } from '../utils/dateUtils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Download,
  FileSpreadsheet,
  FileText,
  Percent,
  Radio,
  Wifi,
  Edit3,
  Calendar,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

export const Reports: React.FC = () => {
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);

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
    { name: 'Manual Override', value: stats?.manualOverrideCount || 2, color: '#a855f7' },
    { name: 'Unverified / Absent', value: 2, color: '#f43f5e' },
  ];

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12" id="reports-view">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Classroom Attendance Analytics &amp; Reports
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Institutional compliance audits &bull; Semester V CSE-A &bull; Hall C-304
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-export-csv"
            onClick={exportAttendanceCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export CSV</span>
          </button>

          <button
            id="btn-export-report"
            onClick={handlePrintReport}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <span className="text-xs font-semibold text-slate-400 uppercase">Overall Attendance</span>
          <p className="text-2xl font-black text-white mt-1">92.1%</p>
          <p className="text-[11px] text-emerald-400 mt-0.5">Class Average</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <span className="text-xs font-semibold text-slate-400 uppercase">RFID Card Scans</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">94.7%</p>
          <p className="text-[11px] text-slate-400 mt-0.5">18 / 19 sessions verified</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <span className="text-xs font-semibold text-slate-400 uppercase">BLE Proximity Rate</span>
          <p className="text-2xl font-black text-cyan-400 mt-1">89.5%</p>
          <p className="text-[11px] text-slate-400 mt-0.5">17 / 19 sessions verified</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <span className="text-xs font-semibold text-slate-400 uppercase">Manual Overrides</span>
          <p className="text-2xl font-black text-purple-400 mt-1">
            {stats?.manualOverrideCount || 2}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Audited by Class Teacher</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Verification Breakdown Pie */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Verification Mode Share
            </h3>
            <p className="text-xs text-slate-400">Distribution of attendance validation types</p>
          </div>

          <div className="h-52 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-300">{item.name}</span>
                </div>
                <span className="font-bold text-white font-mono">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Student-wise Attendance Comparison */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Student-wise Performance Benchmark
              </h3>
              <p className="text-xs text-slate-400">Semester V lecture participation summary</p>
            </div>
            <span className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              Exam Hall-Ticket Ready
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-3 py-3 font-mono">Register No</th>
                  <th className="px-3 py-3">RFID Card</th>
                  <th className="px-3 py-3">Present</th>
                  <th className="px-3 py-3">Absent</th>
                  <th className="px-3 py-3">Attendance %</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {students.map((std) => (
                  <tr key={std.id} className="hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-bold text-white">{std.name}</td>
                    <td className="px-3 py-3 font-mono text-slate-300">{std.studentId}</td>
                    <td className="px-3 py-3 font-mono text-indigo-300">{std.rfidUid}</td>
                    <td className="px-3 py-3 font-bold text-emerald-400">{std.presentClasses}</td>
                    <td className="px-3 py-3 font-bold text-rose-400">{std.absentClasses}</td>
                    <td className="px-3 py-3 font-bold font-mono text-white">
                      {std.attendancePercentage}%
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
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

      {/* Manual Override & Failure Incident Log */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-purple-400" />
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
                className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{rec.studentName}</span>
                    <span className="text-slate-400 font-mono text-[11px]">({rec.studentId})</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300">
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
    </div>
  );
};
