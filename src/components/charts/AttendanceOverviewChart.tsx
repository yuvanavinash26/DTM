import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { WeeklyAttendancePoint } from '../../types/attendance';
import { Student } from '../../types/student';

interface AttendanceOverviewChartProps {
  students: Student[];
  weeklyData: WeeklyAttendancePoint[];
}

export const AttendanceOverviewChart: React.FC<AttendanceOverviewChartProps> = ({
  students,
  weeklyData,
}) => {
  const studentData = students.map((s) => ({
    name: s.name.split(' ')[0], // First name for clean x-axis
    fullName: s.name,
    percentage: s.attendancePercentage,
    present: s.presentClasses,
    absent: s.absentClasses,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5" id="attendance-overview-charts">
      {/* 1. Student Attendance Percentage Bar Chart */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Student Attendance Comparison
            </h3>
            <p className="text-xs text-slate-400">Current semester cumulative rates</p>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Target: 75%+
          </span>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={studentData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickFormatter={(val) => `${val}%`}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl shadow-xl text-xs space-y-1">
                        <p className="font-bold text-white">{data.fullName}</p>
                        <p className="text-indigo-400 font-mono">
                          Attendance: <strong>{data.percentage}%</strong>
                        </p>
                        <p className="text-slate-400">
                          Present: {data.present} | Absent: {data.absent}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="percentage"
                fill="#4f46e5"
                radius={[6, 6, 0, 0]}
                barSize={38}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend / Metrics */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-around text-xs">
          {students.map((s) => (
            <div key={s.id} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
              <span className="text-slate-300 font-medium">{s.name}:</span>
              <span className="text-white font-bold font-mono">{s.attendancePercentage}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Weekly Attendance Rate Chart */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Weekly Attendance Trend
            </h3>
            <p className="text-xs text-slate-400">Classroom verification rate (Sep 2026)</p>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Avg: 90%
          </span>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="day"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickFormatter={(val) => `${val}%`}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl shadow-xl text-xs space-y-1">
                        <p className="font-bold text-white">{data.day} ({data.date})</p>
                        <p className="text-emerald-400 font-mono">
                          Verified Rate: <strong>{data.rate}%</strong>
                        </p>
                        <p className="text-slate-400">
                          Present: {data.presentCount} / {data.presentCount + data.absentCount}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: '#10b981', r: 4 }}
                activeDot={{ r: 6, fill: '#34d399' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bottom indicators */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>Monday (50%) &bull; Tuesday (100%) &bull; Wednesday (50%)</span>
          <span className="font-medium text-emerald-400">Thursday &amp; Friday 100% Verified</span>
        </div>
      </div>
    </div>
  );
};
