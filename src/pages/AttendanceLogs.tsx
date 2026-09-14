import React, { useState, useEffect } from 'react';
import { AttendanceRecord } from '../types/attendance';
import { getAttendance, exportAttendanceCSV } from '../services/attendanceService';
import { StatusBadge } from '../components/ui/StatusBadge';
import { formatDisplayDate } from '../utils/dateUtils';
import { Search, Filter, Download, FileSpreadsheet } from 'lucide-react';

export const AttendanceLogs: React.FC = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadData = async () => {
    const list = await getAttendance();
    setRecords(list);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('dtm_attendance_update', handleUpdate);
    return () => window.removeEventListener('dtm_attendance_update', handleUpdate);
  }, []);

  const filtered = records.filter((r) => {
    const matchesSearch =
      r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.rfidUid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.subject.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      r.finalStatus === statusFilter ||
      (statusFilter === 'MANUAL' && r.manualOverride);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12" id="attendance-logs-view">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Classroom Attendance Logs
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit trail of RFID card swipes, BLE beacons, and teacher manual overrides
          </p>
        </div>

        <button
          id="btn-export-logs-csv"
          onClick={exportAttendanceCSV}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-indigo-400" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="input-logs-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student name, ID, or UID..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <span className="text-slate-400 font-semibold uppercase text-[11px] shrink-0">Filter:</span>
          {['ALL', 'PRESENT', 'PENDING', 'ABSENT', 'MANUAL'].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                statusFilter === filter
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs" id="attendance-logs-table">
            <thead className="bg-slate-950/60 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="px-5 py-3">Date</th>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3 font-mono">Student ID</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3 font-mono">RFID UID</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">RFID</th>
                <th className="px-4 py-3">BLE</th>
                <th className="px-4 py-3">Final Status</th>
                <th className="px-5 py-3 text-right">Method / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((rec) => (
                <tr key={rec.attendanceId} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-slate-200 whitespace-nowrap">
                    {formatDisplayDate(rec.date)}
                  </td>
                  <td className="px-4 py-3.5 font-bold text-white whitespace-nowrap">
                    {rec.studentName}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-slate-300 whitespace-nowrap">
                    {rec.studentId}
                  </td>
                  <td className="px-4 py-3.5 text-slate-300 whitespace-nowrap">
                    {rec.subject}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-indigo-300 whitespace-nowrap">
                    {rec.rfidUid}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-slate-300 whitespace-nowrap">
                    {rec.time}
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge type="rfid" status={rec.rfidStatus} size="sm" />
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge type="ble" status={rec.bleStatus} size="sm" />
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge type="final" status={rec.finalStatus} size="sm" />
                  </td>
                  <td className="px-5 py-3.5 text-right text-slate-400">
                    {rec.manualOverride ? (
                      <span className="text-purple-400 font-semibold">
                        Manual: {rec.reason}
                      </span>
                    ) : (
                      <span className="font-mono text-[11px]">{rec.verificationMethod}</span>
                    )}
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
