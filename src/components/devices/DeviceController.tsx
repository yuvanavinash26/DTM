import React, { useState, useEffect, useRef } from 'react';
import { ESP32Device } from '../../types/device';
import { getDeviceStatus } from '../../services/deviceService';
import {
  recordRFIDScan,
  recordBLEVerification,
  recordBLEExit,
  getAttendanceRecordsInternal,
} from '../../services/attendanceService';
import { getCurrentClass } from '../../services/timetableService';
import { dispatchAttendanceToast } from '../../utils/attendanceLogic';
import { useFlaskAttendance } from '../../hooks/useFlaskAttendance';
import {
  Cpu,
  Radio,
  Wifi,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Zap,
  ArrowRight,
} from 'lucide-react';

interface DeviceControllerProps {
  onEventTriggered?: () => void;
}

export const DeviceController: React.FC<DeviceControllerProps> = ({ onEventTriggered }) => {
  const [device, setDevice] = useState<ESP32Device>(getDeviceStatus());
  const [activeStudentId, setActiveStudentId] = useState<string>('RA2511003020041');
  const [activeStudentName, setActiveStudentName] = useState<string>('Yuvan Avinash');
  const [isProcessing, setIsProcessing] = useState(false);

  // 30-Second Grace Period Countdown State
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(30);
  const countdownTimerRef = useRef<number | null>(null);

  const { isConnected, lastData } = useFlaskAttendance(2000);
  const currentClass = getCurrentClass();

  useEffect(() => {
    const handleDeviceUpdate = () => {
      setDevice(getDeviceStatus());
    };
    window.addEventListener('dtm_device_update', handleDeviceUpdate);
    window.addEventListener('dtm_attendance_update', handleDeviceUpdate);
    return () => {
      window.removeEventListener('dtm_device_update', handleDeviceUpdate);
      window.removeEventListener('dtm_attendance_update', handleDeviceUpdate);
    };
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, []);

  // Get current active student's today attendance status
  const records = getAttendanceRecordsInternal();
  const todayRecord = records.find(
    (r) => r.date === '2026-09-14' && r.studentId === activeStudentId
  );

  const handleScanYuvan = async () => {
    setIsProcessing(true);
    setActiveStudentId('RA2511003020041');
    setActiveStudentName('Yuvan Avinash');

    // Reset any existing BLE countdown
    stopCountdown();

    const res = await recordRFIDScan('4A:D1:02:07', 'DTM-ESP32-01');
    setIsProcessing(false);
    onEventTriggered?.();
  };

  const handleScanKrishothaman = async () => {
    setIsProcessing(true);
    setActiveStudentId('RA2511003020043');
    setActiveStudentName('Krishothaman');

    stopCountdown();

    const res = await recordRFIDScan('51:6C:16:06', 'DTM-ESP32-01');
    setIsProcessing(false);
    onEventTriggered?.();
  };

  const handleBleVerify = async () => {
    setIsProcessing(true);
    stopCountdown();

    await recordBLEVerification(activeStudentId, true, -48);
    setIsProcessing(false);
    onEventTriggered?.();
  };

  const handleBleOutOfRange = () => {
    // Start 30-Second Grace Period
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }

    setIsCountingDown(true);
    setCountdownSeconds(30);

    dispatchAttendanceToast({
      title: 'BLE SIGNAL LOST',
      studentName: activeStudentName,
      studentId: activeStudentId,
      statusText: 'Grace period: 30 seconds active...',
      variant: 'amber',
    });

    countdownTimerRef.current = window.setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimerRef.current!);
          countdownTimerRef.current = null;
          setIsCountingDown(false);
          // Trigger BLE Exit Confirmed
          recordBLEExit(activeStudentId, 'BLE_OUT_OF_RANGE_30_SECONDS');
          onEventTriggered?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleBleReturnToRange = async () => {
    stopCountdown();

    dispatchAttendanceToast({
      title: 'BLE RETURNED TO RANGE',
      studentName: activeStudentName,
      studentId: activeStudentId,
      statusText: 'Grace countdown cancelled. Attendance monitoring continued.',
      variant: 'emerald',
    });

    await recordBLEVerification(activeStudentId, true, -52);
    onEventTriggered?.();
  };

  const handleForceExpiry = async () => {
    stopCountdown();
    await recordBLEExit(activeStudentId, 'BLE_OUT_OF_RANGE_30_SECONDS');
    onEventTriggered?.();
  };

  const stopCountdown = () => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setIsCountingDown(false);
    setCountdownSeconds(30);
  };

  const isClassActive = currentClass.attendanceMode === 'ACTIVE';

  return (
    <div
      id="classroom-device-controller"
      className="erp-card rounded-2xl overflow-hidden shadow-xl"
    >
      {/* Top Header / Hardware status bar */}
      <div className="px-5 py-3.5 bg-slate-950/60 border-b border-white/5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">
                Classroom Hardware Gateway
              </h3>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                ONLINE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              DTM-ESP32-01 &bull; RC522 RFID &amp; BLE 5.0 Gateway
            </p>
          </div>
        </div>

        {/* Telemetry quick badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-300">
          <div className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-white/10 shrink-0">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">RFID:</span>
            <span className="text-emerald-400 font-semibold">{device.rfidReaderStatus}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-white/10 shrink-0">
            <Wifi className="w-3.5 h-3.5 text-teal-400" />
            <span className="text-slate-400">BLE:</span>
            <span className="text-teal-400 font-semibold">{device.bleScannerStatus}</span>
          </div>

          {/* Timetable enforcement badge */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-sans font-bold shrink-0 ${
              isClassActive
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>{currentClass.statusMessage}</span>
          </div>
        </div>
      </div>

      {/* Controller Area */}
      <div className="p-5 space-y-4">
        {/* Active Student & Verification Flow State */}
        <div className="p-4 rounded-xl bg-slate-950/40 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Active Verification Target
            </span>
            <h4 className="text-base font-extrabold text-white mt-0.5">
              {activeStudentName} <span className="text-emerald-400 font-mono text-xs">({activeStudentId})</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Scheduled: <strong>{currentClass.currentSubject}</strong> ({currentClass.subjectCode}) &bull; {currentClass.periodLabel}
            </p>
          </div>

          {/* Verification Pipeline Display: RFID ✓ | BLE ••• | FINAL */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-900/80 px-3.5 py-2 rounded-xl border border-white/10 shrink-0">
            {/* RFID Step */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-400">RFID:</span>
              <span
                className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                  todayRecord?.rfidStatus === 'VERIFIED'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {todayRecord?.rfidStatus === 'VERIFIED' ? 'RFID ✓' : 'NOT DETECTED'}
              </span>
            </div>

            <ArrowRight className="w-3 h-3 text-slate-600" />

            {/* BLE Step */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-400">BLE:</span>
              <span
                className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                  todayRecord?.bleStatus === 'VERIFIED' || todayRecord?.bleStatus === 'PRESENT'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : todayRecord?.bleStatus === 'PENDING'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {todayRecord?.bleStatus === 'VERIFIED' || todayRecord?.bleStatus === 'PRESENT'
                  ? 'BLE ✓'
                  : todayRecord?.bleStatus === 'PENDING'
                  ? 'BLE •••'
                  : todayRecord?.bleStatus || 'PENDING'}
              </span>
            </div>

            <ArrowRight className="w-3 h-3 text-slate-600" />

            {/* Final State */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-400">Final:</span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${
                  todayRecord?.finalStatus === 'PRESENT'
                    ? 'bg-emerald-500 text-slate-950 font-black'
                    : todayRecord?.finalStatus === 'MANUALLY_MARKED'
                    ? 'bg-purple-500 text-white font-bold'
                    : todayRecord?.finalStatus === 'ABSENT'
                    ? 'bg-rose-500 text-white font-bold'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {todayRecord?.finalStatus === 'PRESENT'
                  ? 'PRESENT'
                  : todayRecord?.finalStatus === 'MANUALLY_MARKED'
                  ? 'MANUAL'
                  : todayRecord?.finalStatus === 'ABSENT'
                  ? 'ABSENT'
                  : 'VERIFICATION PENDING'}
              </span>
            </div>
          </div>
        </div>

        {/* 30-Second Grace Period Active Banner */}
        {isCountingDown && (
          <div
            id="ble-grace-period-banner"
            className="p-4 rounded-xl bg-amber-500/15 border border-amber-500/40 animate-in fade-in duration-200"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-lg font-mono">
                  {countdownSeconds}s
                </div>
                <div>
                  <h5 className="text-sm font-bold text-amber-200 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    BLE SIGNAL LOST &bull; GRACE PERIOD ACTIVE
                  </h5>
                  <p className="text-xs text-amber-200/80 mt-0.5">
                    Phone out of proximity range for {activeStudentName}. 30-second countdown before recording BLE exit event.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="btn-ble-return-banner"
                  onClick={handleBleReturnToRange}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors shadow-md shadow-emerald-600/20"
                >
                  Return to Range
                </button>
                <button
                  type="button"
                  id="btn-force-expiry-banner"
                  onClick={handleForceExpiry}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-rose-300 rounded-lg text-xs font-semibold border border-rose-500/30 transition-colors"
                >
                  Force 30s Expiry
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-800/80 rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className="bg-amber-400 h-1.5 rounded-full transition-all duration-1000"
                style={{ width: `${(countdownSeconds / 30) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* CONTROLS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* LEFT: RFID SCAN BUTTONS */}
          <div className="p-4 rounded-xl bg-slate-950/40 border border-white/5 space-y-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-emerald-400" />
                RFID Card Tap Simulation
              </span>
              {!isClassActive && (
                <span className="text-[10px] text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                  {currentClass.reason || 'Outside Hours'}
                </span>
              )}
            </div>

            <div className="space-y-2.5">
              {/* Scan Yuvan */}
              <button
                type="button"
                id="btn-scan-yuvan"
                disabled={isProcessing}
                onClick={handleScanYuvan}
                className="erp-btn w-full flex items-center justify-between p-3 rounded-xl bg-slate-900/80 hover:bg-emerald-950/30 text-white border border-white/10 hover:border-emerald-500/50 transition-all text-left shadow-sm group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span className="truncate">Yuvan Avinash</span>
                      <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-1.5 py-0.5 rounded">RA2511003020041</span>
                    </div>
                    <div className="text-[11px] font-mono text-emerald-400 mt-0.5">
                      UID: 4A:D1:02:07
                    </div>
                  </div>
                </div>

                <span className="shrink-0 px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 text-[11px] font-extrabold uppercase tracking-wide flex items-center gap-1 shadow-sm">
                  Scan Card
                </span>
              </button>

              {/* Scan Krishothaman */}
              <button
                type="button"
                id="btn-scan-krish"
                disabled={isProcessing}
                onClick={handleScanKrishothaman}
                className="erp-btn w-full flex items-center justify-between p-3 rounded-xl bg-slate-900/80 hover:bg-emerald-950/30 text-white border border-white/10 hover:border-emerald-500/50 transition-all text-left shadow-sm group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span className="truncate">Krishothaman</span>
                      <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-1.5 py-0.5 rounded">RA2511003020043</span>
                    </div>
                    <div className="text-[11px] font-mono text-emerald-400 mt-0.5">
                      UID: 51:6C:16:06
                    </div>
                  </div>
                </div>

                <span className="shrink-0 px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 text-[11px] font-extrabold uppercase tracking-wide flex items-center gap-1 shadow-sm">
                  Scan Card
                </span>
              </button>
            </div>
          </div>

          {/* RIGHT: BLE SIMULATOR CONTROLS */}
          <div className="p-4 rounded-xl bg-slate-950/40 border border-white/5 space-y-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                <Wifi className="w-4 h-4 text-teal-400" />
                BLE Proximity Controls
              </span>
              <span className="text-[10px] font-mono text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                Target: <strong className="text-white">{activeStudentName}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* BLE Verify */}
              <button
                type="button"
                id="btn-ble-verify"
                disabled={isProcessing}
                onClick={handleBleVerify}
                className="erp-btn flex items-center gap-2.5 p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 transition-all text-left"
              >
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="min-w-0">
                  <span className="block text-xs font-bold text-emerald-200 truncate">BLE VERIFY</span>
                  <span className="block text-[10px] text-emerald-400/80 font-mono">In-Range (-48dBm)</span>
                </div>
              </button>

              {/* BLE Out of Range */}
              <button
                type="button"
                id="btn-ble-out-of-range"
                disabled={isProcessing || isCountingDown}
                onClick={handleBleOutOfRange}
                className="erp-btn flex items-center gap-2.5 p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 transition-all text-left disabled:opacity-50"
              >
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="min-w-0">
                  <span className="block text-xs font-bold text-amber-200 truncate">OUT OF RANGE</span>
                  <span className="block text-[10px] text-amber-400/80 font-mono">30s Grace Timer</span>
                </div>
              </button>

              {/* BLE Return to Range */}
              <button
                type="button"
                id="btn-ble-return"
                disabled={isProcessing}
                onClick={handleBleReturnToRange}
                className="erp-btn flex items-center gap-2.5 p-2.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-300 transition-all text-left"
              >
                <Wifi className="w-4 h-4 text-teal-400 shrink-0" />
                <div className="min-w-0">
                  <span className="block text-xs font-bold text-teal-200 truncate">RETURN RANGE</span>
                  <span className="block text-[10px] text-teal-400/80 font-mono">Retain Session</span>
                </div>
              </button>

              {/* Force 30s Expiry */}
              <button
                type="button"
                id="btn-force-expiry"
                disabled={isProcessing}
                onClick={handleForceExpiry}
                className="erp-btn flex items-center gap-2.5 p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 transition-all text-left"
              >
                <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <div className="min-w-0">
                  <span className="block text-xs font-bold text-rose-200 truncate">FORCE EXPIRY</span>
                  <span className="block text-[10px] text-rose-400/80 font-mono">Record Exit Event</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
