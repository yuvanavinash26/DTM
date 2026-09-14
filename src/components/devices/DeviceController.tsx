import React, { useState, useEffect } from 'react';
import { ESP32Device } from '../../types/device';
import { getDeviceStatus } from '../../services/deviceService';
import {
  recordRFIDScan,
  recordBLEVerification,
  resetTodaysVerification,
} from '../../services/attendanceService';
import { useFlaskAttendance } from '../../hooks/useFlaskAttendance';
import { Cpu, Radio, Wifi, RefreshCw, Smartphone, CheckCircle, XCircle, Activity } from 'lucide-react';

interface DeviceControllerProps {
  onEventTriggered?: () => void;
}

export const DeviceController: React.FC<DeviceControllerProps> = ({ onEventTriggered }) => {
  const [device, setDevice] = useState<ESP32Device>(getDeviceStatus());
  const [activeStudentId, setActiveStudentId] = useState<string>('RA25110030200411'); // Default Yuvan
  const [isProcessing, setIsProcessing] = useState(false);
  const { isConnected, lastData, lastSeenFormatted } = useFlaskAttendance(2000);

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

  const handleScanYuvan = async () => {
    setIsProcessing(true);
    setActiveStudentId('RA25110030200411');
    await recordRFIDScan('4A:D1:02:07', 'DTM-ESP32-01');
    setIsProcessing(false);
    onEventTriggered?.();
  };

  const handleScanKrishothaman = async () => {
    setIsProcessing(true);
    setActiveStudentId('RA2511003020043');
    await recordRFIDScan('51:6C:16:06', 'DTM-ESP32-01');
    setIsProcessing(false);
    onEventTriggered?.();
  };

  const handleBleVerify = async () => {
    setIsProcessing(true);
    await recordBLEVerification(activeStudentId, true, -48);
    setIsProcessing(false);
    onEventTriggered?.();
  };

  const handleBleFail = async () => {
    setIsProcessing(true);
    await recordBLEVerification(activeStudentId, false, -89);
    setIsProcessing(false);
    onEventTriggered?.();
  };

  const handleReset = async () => {
    setIsProcessing(true);
    await resetTodaysVerification();
    setIsProcessing(false);
    onEventTriggered?.();
  };

  return (
    <div
      id="classroom-device-controller"
      className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden backdrop-blur-sm"
    >
      {/* Top Header / Hardware status bar */}
      <div className="px-5 py-3.5 bg-slate-950/70 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-inner">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">
                Classroom Device Gateway
              </h3>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                ONLINE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              {device.deviceId} &bull; {device.classroom}
            </p>
          </div>
        </div>

        {/* Telemetry quick badges */}
        <div className="flex items-center gap-4 text-xs font-mono text-slate-300">
          <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">RFID Reader:</span>
            <span className="text-emerald-400 font-semibold">{device.rfidReaderStatus}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
            <Wifi className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">BLE Scanner:</span>
            <span className="text-cyan-400 font-semibold">{device.bleScannerStatus}</span>
          </div>
        </div>
      </div>

      {/* Controller Area */}
      <div className="p-5 space-y-4">
        {/* Device Live State */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-400 font-medium">Last Scan</span>
            <p className="text-sm font-bold text-white mt-0.5 font-mono">
              {device.lastScanTime || '10:42:31 AM'}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-400 font-medium">Last Student</span>
            <p className="text-sm font-bold text-white mt-0.5 truncate">
              {device.lastStudentName || 'Yuvan Avinash'}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-400 font-medium">Last RFID UID</span>
            <p className="text-sm font-bold text-indigo-300 mt-0.5 font-mono">
              {device.lastRfidUid || '4A:D1:02:07'}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-400 font-medium">Last RSSI</span>
            <p className="text-sm font-bold text-cyan-300 mt-0.5 font-mono">
              {device.lastRssi || -48} dBm
            </p>
          </div>
        </div>

        {/* Hardware Action Buttons */}
        <div className="space-y-2">
          {isConnected && lastData && (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Flask Bluetooth Stream Active: {lastData.student} ({lastData.bluetooth}, RSSI: {lastData.rssi !== null && lastData.rssi !== undefined ? `${lastData.rssi} dBm` : 'null'})
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">2s Polling</span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 uppercase tracking-wider">
              Classroom Attendance Simulator
            </span>
            <span className="text-slate-400 text-[11px]">
              Active target: <strong className="text-white">{activeStudentId === 'RA25110030200411' ? 'Yuvan Avinash' : 'Krishothaman'}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {/* 1. Scan Yuvan */}
            <button
              type="button"
              id="btn-scan-yuvan"
              disabled={isProcessing}
              onClick={handleScanYuvan}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left transition-all active:scale-95 group"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Radio className="w-3.5 h-3.5 text-emerald-400 group-hover:animate-ping" />
                <span>Scan Yuvan</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono mt-0.5">UID: 4A:D1:02:07</span>
            </button>

            {/* 2. Scan Krishothaman */}
            <button
              type="button"
              id="btn-scan-krish"
              disabled={isProcessing}
              onClick={handleScanKrishothaman}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left transition-all active:scale-95 group"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Radio className="w-3.5 h-3.5 text-emerald-400 group-hover:animate-ping" />
                <span>Scan Krishothaman</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono mt-0.5">UID: 51:6C:16:06</span>
            </button>

            {/* 3. BLE Verify */}
            <button
              type="button"
              id="btn-ble-verify"
              disabled={isProcessing}
              onClick={handleBleVerify}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-800/60 text-cyan-200 transition-all active:scale-95"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                <span>BLE Verify</span>
              </div>
              <span className="text-[10px] text-cyan-300/80 font-mono mt-0.5">-48 dBm (In Range)</span>
            </button>

            {/* 4. BLE Fail */}
            <button
              type="button"
              id="btn-ble-fail"
              disabled={isProcessing}
              onClick={handleBleFail}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/60 text-rose-200 transition-all active:scale-95"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>BLE Fail</span>
              </div>
              <span className="text-[10px] text-rose-300/80 font-mono mt-0.5">-89 dBm (Out of Range)</span>
            </button>

            {/* 5. Reset Verification */}
            <button
              type="button"
              id="btn-reset-verification"
              disabled={isProcessing}
              onClick={handleReset}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/60 text-slate-300 transition-all active:scale-95 col-span-2 sm:col-span-1"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
                <span>Reset</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono mt-0.5">Sync Baseline</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
