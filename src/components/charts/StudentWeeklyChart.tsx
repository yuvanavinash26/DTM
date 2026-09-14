import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface StudentWeeklyChartProps {
  studentName: string;
}

export const StudentWeeklyChart: React.FC<StudentWeeklyChartProps> = ({ studentName }) => {
  const isYuvan = studentName.toLowerCase().includes('yuvan');

  // Realistic subject performance data
  const subjectPerformance = isYuvan
    ? [
        { subject: 'Data Struct', percentage: 100, attended: 4, total: 4 },
        { subject: 'Computer Arch', percentage: 100, attended: 3, total: 3 },
        { subject: 'DTM', percentage: 100, attended: 4, total: 4 },
        { subject: 'Operating Sys', percentage: 100, attended: 3, total: 3 },
        { subject: 'Networks', percentage: 75, attended: 3, total: 4 },
        { subject: 'Maths', percentage: 100, attended: 4, total: 4 },
      ]
    : [
        { subject: 'Data Struct', percentage: 100, attended: 4, total: 4 },
        { subject: 'Computer Arch', percentage: 100, attended: 3, total: 3 },
        { subject: 'DTM', percentage: 100, attended: 4, total: 4 },
        { subject: 'Operating Sys', percentage: 100, attended: 3, total: 3 },
        { subject: 'Prog in C', percentage: 67, attended: 2, total: 3 },
        { subject: 'Maths', percentage: 75, attended: 3, total: 4 },
      ];

  return (
    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">
            Subject-wise Attendance Performance
          </h3>
          <p className="text-xs text-slate-400">RFID + BLE verified class participation</p>
        </div>
        <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Minimum 75% Criteria Met
        </span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={subjectPerformance}
            margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="subject"
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
                      <p className="font-bold text-white">{data.subject}</p>
                      <p className="text-emerald-400 font-mono">
                        Attendance: <strong>{data.percentage}%</strong>
                      </p>
                      <p className="text-slate-400">
                        Attended: {data.attended} / {data.total} lectures
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="percentage"
              fill="#3b82f6"
              radius={[6, 6, 0, 0]}
              barSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span>Verified by Dual RFID &amp; Beacon RSSI proximity</span>
        <span className="font-mono text-indigo-400">Semester V &bull; Section A</span>
      </div>
    </div>
  );
};
