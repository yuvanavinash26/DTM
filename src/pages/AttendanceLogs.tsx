import React, { useState, useEffect } from 'react';
import { AttendanceRecord } from '../types/attendance';
import { getAttendance, exportAttendanceCSV } from '../services/attendanceService';
import { StatusBadge } from '../components/ui/StatusBadge';
import { formatDisplayDate } from '../utils/dateUtils';
import { Search, Download, FileSpreadsheet } from 'lucide-react';

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
      {/* ERP Audit Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-[var(--erp-text-main)]">
            Institutional Attendance Audit Logs
          </h2>
          <p className="text-xs text-[var(--erp-text-muted)] mt-0.5">
            Immutable audit record of dual-factor RFID swipes, BLE beacon telemetry, and faculty overrides
          </p>
        </div>

        <button
          id="btn-export-logs-csv"
          onClick={exportAttendanceCSV}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--erp-card)] hover:bg-[var(--erp-card-hover)] border border-[var(--erp-border)] text-xs font-bold text-[var(--erp-text-main)] transition-all erp-btn shadow-sm"
        >
          <Download className="w-3.5 h-3.5 text-emerald-500" />
          <span>Export Official CSV</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-xl erp-card flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[var(--erp-text-faint)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="input-logs-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student, roll number, or RFID UID..."
            className="w-full bg-[var(--erp-card-subtle)] border border-[var(--erp-border)] rounded-xl pl-9 pr-3.5 py-2 text-[var(--erp-text-main)] placeholder:text-[var(--erp-text-faint)] focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          <span className="text-[var(--erp-text-faint)] font-bold uppercase text-[10px] shrink-0 mr-1">Filter Status:</span>
          {['ALL', 'PRESENT', 'PENDING', 'ABSENT', 'MANUAL'].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all erp-btn text-xs ${
                statusFilter === filter
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-[var(--erp-card-subtle)] text-[var(--erp-text-muted)] border border-[var(--erp-border)] hover:text-[var(--erp-text-main)]'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Data Table */}
      <div className="rounded-2xl border border-[var(--erp-border)] erp-card shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs erp-table" id="attendance-logs-table">
            <thead className="bg-[var(--erp-card-subtle)] text-[var(--erp-text-muted)] uppercase tracking-wider font-bold border-b border-[var(--erp-border)] text-[11px]">
              <tr>
                <th className="px-5 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Student Name</th>
                <th className="px-4 py-3 font-mono text-left">Roll Number</th>
                <th className="px-4 py-3 text-left">Course / Subject</th>
                <th className="px-4 py-3 font-mono text-center">RFID UID</th>
                <th className="px-4 py-3 font-mono text-center">Entry Time</th>
                <th className="px-4 py-3 text-center">RFID Status</th>
                <th className="px-4 py-3 text-center">BLE Status</th>
                <th className="px-4 py-3 text-center">Final Status</th>
                <th className="px-5 py-3 text-right">Audit Method / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--erp-border)]">
              {filtered.map((rec) => (
                <tr key={rec.attendanceId} className="hover:bg-[var(--erp-card-hover)] transition-colors">
                  <td className="px-5 py-3.5 font-medium text-[var(--erp-text-main)] whitespace-nowrap text-left">
                    {formatDisplayDate(rec.date)}
                  </td>
                  <td className="px-4 py-3.5 font-bold text-[var(--erp-text-main)] whitespace-nowrap text-left">
                    {rec.studentName}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[var(--erp-text-muted)] whitespace-nowrap text-left tabular-nums">
                    {rec.studentId}
                  </td>
                  <td className="px-4 py-3.5 text-[var(--erp-text-main)] whitespace-nowrap text-left">
                    {rec.subject}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-emerald-500 whitespace-nowrap text-center tabular-nums">
                    {rec.rfidUid}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[var(--erp-text-main)] whitespace-nowrap text-center tabular-nums">
                    {rec.time}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <div className="inline-flex justify-center">
                      <StatusBadge type="rfid" status={rec.rfidStatus} size="sm" />
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <div className="inline-flex justify-center">
                      <StatusBadge type="ble" status={rec.bleStatus} size="sm" />
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <div className="inline-flex justify-center">
                      <StatusBadge type="final" status={rec.finalStatus} size="sm" />
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right text-[var(--erp-text-muted)] whitespace-nowrap">
                    {rec.manualOverride ? (
                      <span className="text-purple-500 font-semibold text-xs">
                        Faculty Override ({rec.reason})
                      </span>
                    ) : (
                      <span className="font-mono text-[11px] bg-[var(--erp-card-subtle)] px-2 py-0.5 rounded border border-[var(--erp-border)]">
                        {rec.verificationMethod}
                      </span>
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

