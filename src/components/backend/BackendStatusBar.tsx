import React from 'react';
import { useFlaskAttendance } from '../../hooks/useFlaskAttendance';
import { StatusBadge } from '../ui/StatusBadge';
import {
  Wifi,
  WifiOff,
  Radio,
  RefreshCw,
  Clock,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export const BackendStatusBar: React.FC = () => {
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

  return (
    <div
      id="flask-backend-status-bar"
      className={`rounded-2xl border p-4 transition-all duration-300 shadow-lg ${
        isConnected
          ? 'bg-slate-900/90 border-emerald-500/30 ring-1 ring-emerald-500/20'
          : 'bg-slate-900/90 border-amber-500/30'
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Backend connection identity */}
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isConnected
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}
          >
            {isConnected ? (
              <Wifi className="w-5 h-5 text-emerald-400" />
            ) : (
              <WifiOff className="w-5 h-5 text-amber-400" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Bluetooth Attendance Backend
              </span>
              {isConnected ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Backend Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                  Backend Offline
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
              <span className="font-mono text-slate-300">
                http://localhost:8000/api/attendance
              </span>
              <span>&bull;</span>
              <span className="font-mono text-[11px] text-slate-400">
                Polling: 2s &bull; Last: {lastChecked || 'Pending'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Live Data Feed or Offline Prompt */}
        {isConnected && lastData ? (
          <div className="flex flex-wrap items-center gap-3 bg-slate-950/70 px-4 py-2.5 rounded-xl border border-slate-800 text-xs">
            {/* Student Name */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Student:</span>
              <span className="font-bold text-white tracking-tight">
                {lastData.student}
              </span>
            </div>

            <span className="text-slate-700 hidden sm:inline">|</span>

            {/* Bluetooth Status */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Bluetooth:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded-full text-[11px] uppercase tracking-wide ${
                  lastData.bluetooth === 'PRESENT'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                }`}
              >
                {lastData.bluetooth}
              </span>
            </div>

            <span className="text-slate-700 hidden sm:inline">|</span>

            {/* Attendance Status */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">API Attendance:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded-full text-[11px] uppercase tracking-wide ${
                  lastData.attendance === 'PRESENT'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                }`}
              >
                {lastData.attendance}
              </span>
            </div>

            {/* RSSI (when available) */}
            {lastData.rssi !== null && lastData.rssi !== undefined && (
              <>
                <span className="text-slate-700 hidden sm:inline">|</span>
                <div className="flex items-center gap-1 text-cyan-300 font-mono">
                  <Radio className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{lastData.rssi} dBm</span>
                </div>
              </>
            )}

            {/* Last Seen */}
            <span className="text-slate-700 hidden sm:inline">|</span>
            <div className="flex items-center gap-1 text-indigo-300 font-mono text-[11px]">
              <Clock className="w-3 h-3 text-indigo-400" />
              <span>Seen: {lastSeenFormatted}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <p className="text-xs text-amber-200/90 max-w-md">
              Flask server not detected on localhost:8000. Start your Flask script to stream live Bluetooth scans.
            </p>
            <button
              type="button"
              id="btn-statusbar-retry"
              onClick={triggerRetry}
              disabled={isRetrying}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-amber-400 ${
                  isRetrying ? 'animate-spin' : ''
                }`}
              />
              <span>{isRetrying ? 'Checking...' : 'Retry'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
