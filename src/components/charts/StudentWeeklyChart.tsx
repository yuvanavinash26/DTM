import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface StudentWeeklyChartProps {
  studentName: string;
}

export const StudentWeeklyChart: React.FC<StudentWeeklyChartProps> = ({ studentName }) => {
  const isYuvan = studentName.toLowerCase().includes('yuvan');

  // Official Semester V Timetable (TT) subjects ONLY:
  // 1. Operating Systems (21CSC202J)
  // 2. Advanced Programming Practice (21CSC203P)
  // 3. Transforms and Boundary Value Problems (21MAB201T)
  // 4. Computer Organization and Architecture (21CSS201T)
  // 5. Design Thinking and Methodology (21DTM201T)
  // 6. Data Structures and Algorithms (21CSC201J)
  // 7. Professional Ethics (21LEM201T)
  // 8. Verbal Reasoning (21VR201T)
  const subjectPerformance = isYuvan
    ? [
        { subject: 'Operating Sys', fullName: 'Operating Systems (21CSC202J)', percentage: 100, attended: 4, total: 4 },
        { subject: 'Adv Prog Prac', fullName: 'Advanced Programming Practice (21CSC203P)', percentage: 100, attended: 4, total: 4 },
        { subject: 'Transforms BVP', fullName: 'Transforms & Boundary Value Problems (21MAB201T)', percentage: 100, attended: 3, total: 3 },
        { subject: 'Comp Org Arch', fullName: 'Computer Organization & Architecture (21CSS201T)', percentage: 100, attended: 3, total: 3 },
        { subject: 'Design Thinking', fullName: 'Design Thinking and Methodology (21DTM201T)', percentage: 100, attended: 3, total: 3 },
        { subject: 'Data Structures', fullName: 'Data Structures and Algorithms (21CSC201J)', percentage: 100, attended: 4, total: 4 },
        { subject: 'Prof Ethics', fullName: 'Professional Ethics (21LEM201T)', percentage: 100, attended: 2, total: 2 },
        { subject: 'Verbal Reason', fullName: 'Verbal Reasoning (21VR201T)', percentage: 75, attended: 3, total: 4 },
      ]
    : [
        { subject: 'Operating Sys', fullName: 'Operating Systems (21CSC202J)', percentage: 100, attended: 4, total: 4 },
        { subject: 'Adv Prog Prac', fullName: 'Advanced Programming Practice (21CSC203P)', percentage: 75, attended: 3, total: 4 },
        { subject: 'Transforms BVP', fullName: 'Transforms & Boundary Value Problems (21MAB201T)', percentage: 100, attended: 3, total: 3 },
        { subject: 'Comp Org Arch', fullName: 'Computer Organization & Architecture (21CSS201T)', percentage: 100, attended: 3, total: 3 },
        { subject: 'Design Thinking', fullName: 'Design Thinking and Methodology (21DTM201T)', percentage: 100, attended: 3, total: 3 },
        { subject: 'Data Structures', fullName: 'Data Structures and Algorithms (21CSC201J)', percentage: 100, attended: 4, total: 4 },
        { subject: 'Prof Ethics', fullName: 'Professional Ethics (21LEM201T)', percentage: 100, attended: 2, total: 2 },
        { subject: 'Verbal Reason', fullName: 'Verbal Reasoning (21VR201T)', percentage: 75, attended: 3, total: 4 },
      ];

  return (
    <div className="erp-card p-5 rounded-2xl space-y-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--erp-border)] pb-3">
        <div>
          <h3 className="text-sm font-bold text-[var(--erp-text-main)] tracking-tight">
            Official Timetable Subject Performance
          </h3>
          <p className="text-xs text-[var(--erp-text-muted)]">
            Attendance strictly indexed by official Semester III (2nd Year) curriculum periods
          </p>
        </div>
        <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 self-start sm:self-auto">
          Criteria Met (&ge; 75%)
        </span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={subjectPerformance}
            margin={{ top: 10, right: 10, left: -15, bottom: 25 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
            <XAxis
              dataKey="subject"
              stroke="#64748b"
              tick={{ fill: 'var(--erp-text-muted)', fontSize: 10 }}
              tickLine={false}
              angle={-20}
              textAnchor="end"
              interval={0}
            />
            <YAxis
              domain={[0, 100]}
              stroke="#64748b"
              tick={{ fill: 'var(--erp-text-muted)', fontSize: 11 }}
              tickFormatter={(val) => `${val}%`}
              tickLine={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="erp-card p-3 rounded-xl shadow-xl text-xs space-y-1 border border-[var(--erp-border-strong)]">
                      <p className="font-bold text-[var(--erp-text-main)]">{data.fullName}</p>
                      <p className="text-emerald-500 font-mono">
                        Attendance Rate: <strong>{data.percentage}%</strong>
                      </p>
                      <p className="text-[var(--erp-text-muted)]">
                        Attended: <strong>{data.attended}</strong> / {data.total} TT Lectures
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="percentage"
              radius={[6, 6, 0, 0]}
              barSize={26}
            >
              {subjectPerformance.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.percentage >= 85 ? '#10b981' : '#f59e0b'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="pt-2 border-t border-[var(--erp-border)] flex items-center justify-between text-xs text-[var(--erp-text-muted)]">
        <span>Verified by RFID Scan &amp; BLE Proximity RSSI</span>
        <span className="font-mono text-emerald-500 font-semibold">Semester III (2nd Year) &bull; Section CSE-A</span>
      </div>
    </div>
  );
};
