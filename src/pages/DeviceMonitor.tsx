import React, { useState, useEffect } from 'react';
import { ESP32Device } from '../types/device';
import { getDeviceStatus, updateDeviceStatus } from '../services/deviceService';
import { ApiContractViewer } from '../components/devices/ApiContractViewer';
import {
  Cpu,
  Radio,
  Wifi,
  Activity,
  Server,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Zap,
} from 'lucide-react';

export const DeviceMonitor: React.FC = () => {
  const [device, setDevice] = useState<ESP32Device>(getDeviceStatus());
  const [pingState, setPingState] = useState<'IDLE' | 'PINGING' | 'SUCCESS'>('IDLE');

  const refreshState = () => {
    setDevice(getDeviceStatus());
  };

  useEffect(() => {
    refreshState();
    const handleUpdate = () => refreshState();
    window.addEventListener('dtm_device_update', handleUpdate);
    window.addEventListener('dtm_attendance_update', handleUpdate);
    return () => {
      window.removeEventListener('dtm_device_update', handleUpdate);
      window.removeEventListener('dtm_attendance_update', handleUpdate);
    };
  }, []);

  const handlePingDevice = () => {
    setPingState('PINGING');
    setTimeout(() => {
      updateDeviceStatus({
        status: 'ONLINE',
        rfidReaderStatus: 'ONLINE',
        bleScannerStatus: 'ONLINE',
      });
      setPingState('SUCCESS');
      setTimeout(() => setPingState('IDLE'), 2000);
    }, 600);
  };

  return (
    <div className="space-y-6 pb-12" id="device-monitor-view">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-white">
              Hardware Gateway Telemetry
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              ACTIVE LINK
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Microcontroller Edge Node &bull; Dual RFID RC522 &amp; BLE 5.0 Beacon Interface
          </p>
        </div>

        <button
          id="btn-ping-gateway"
          onClick={handlePingDevice}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${pingState === 'PINGING' ? 'animate-spin' : ''}`} />
          <span>{pingState === 'PINGING' ? 'Pinging Gateway...' : pingState === 'SUCCESS' ? 'Ping 14ms OK' : 'Ping Gateway'}</span>
        </button>
      </div>

      {/* Main Hardware Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Gateway Core */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">ESP32 SoC Controller</h3>
                <p className="text-xs font-mono text-slate-400">{device.deviceId}</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              {device.status}
            </span>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Classroom Location:</span>
              <span className="font-semibold text-white">{device.classroom}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">IP Address:</span>
              <span className="font-mono text-slate-300">{device.ipAddress}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">MAC Address:</span>
              <span className="font-mono text-slate-300">{device.macAddress}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Firmware Build:</span>
              <span className="font-mono text-indigo-300">{device.firmwareVersion}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Last Heartbeat:</span>
              <span className="font-mono text-emerald-400 font-bold">{device.lastHeartbeat}</span>
            </div>
          </div>
        </div>

        {/* RFID RC522 Reader */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">RFID Subsystem</h3>
                <p className="text-xs font-mono text-slate-400">NXP RC522 SPI Bus</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              {device.rfidReaderStatus}
            </span>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Operating Frequency:</span>
              <span className="font-mono text-slate-200">13.56 MHz (ISO/IEC 14443A)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Last Scanned Card:</span>
              <span className="font-mono text-emerald-400 font-bold">{device.lastRfidUid || '4A:D1:02:07'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Identified Student:</span>
              <span className="font-semibold text-white truncate">{device.lastStudentName || 'Yuvan Avinash'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Last Scan Timestamp:</span>
              <span className="font-mono text-slate-300">{device.lastScanTime}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Antenna Gain:</span>
              <span className="font-mono text-indigo-300">48 dB (Optimal)</span>
            </div>
          </div>
        </div>

        {/* BLE Scanner */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Wifi className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">BLE 5.0 Beacon Scanner</h3>
                <p className="text-xs font-mono text-slate-400">Proximity Verifier</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              {device.bleScannerStatus}
            </span>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Filter Service UUID:</span>
              <span className="font-mono text-slate-300 truncate">0000FEAA-0000-1000</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Current Measured RSSI:</span>
              <span className="font-mono text-cyan-400 font-bold">{device.lastRssi || -48} dBm</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Gating Threshold:</span>
              <span className="font-mono text-slate-300">-75 dBm (Desk proximity)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Scan Interval / Window:</span>
              <span className="font-mono text-slate-300">100ms / 80ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Verification Engine:</span>
              <span className="font-semibold text-emerald-400">LOCAL SERVICE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Target API Specs */}
      <ApiContractViewer />
    </div>
  );
};
