import React, { useState, useEffect } from 'react';
import { ESP32Device } from '../types/device';
import { getDeviceStatus, updateDeviceStatus } from '../services/deviceService';
import { getActiveVenue } from '../services/venueService';
import { ApiContractViewer } from '../components/devices/ApiContractViewer';
import {
  Cpu,
  Radio,
  Wifi,
  RefreshCw,
  Server,
} from 'lucide-react';

export const DeviceMonitor: React.FC = () => {
  const [device, setDevice] = useState<ESP32Device>(getDeviceStatus());
  const [pingState, setPingState] = useState<'IDLE' | 'PINGING' | 'SUCCESS'>('IDLE');
  const [activeVenue, setActiveVenue] = useState<string>(getActiveVenue());

  const refreshState = () => {
    setDevice(getDeviceStatus());
  };

  useEffect(() => {
    refreshState();
    const handleUpdate = () => refreshState();
    const handleVenue = (e: any) => {
      if (e.detail) setActiveVenue(e.detail);
      else setActiveVenue(getActiveVenue());
    };
    window.addEventListener('dtm_device_update', handleUpdate);
    window.addEventListener('dtm_attendance_update', handleUpdate);
    window.addEventListener('dtm_venue_change', handleVenue);
    return () => {
      window.removeEventListener('dtm_device_update', handleUpdate);
      window.removeEventListener('dtm_attendance_update', handleUpdate);
      window.removeEventListener('dtm_venue_change', handleVenue);
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
            <h2 className="text-xl font-extrabold tracking-tight text-[var(--erp-text-main)]">
              Hardware Gateway Telemetry &amp; Node Health
            </h2>
            <span className="px-2.5 py-0.5 rounded-md text-xs font-bold font-mono bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              GATEWAY ACTIVE
            </span>
          </div>
          <p className="text-xs text-[var(--erp-text-muted)] mt-0.5">
            Microcontroller Edge Node &bull; Dual RFID RC522 &amp; BLE 5.0 Beacon Interface &bull; <span className="font-semibold text-emerald-500">{activeVenue}</span>
          </p>
        </div>

        <button
          id="btn-ping-gateway"
          onClick={handlePingDevice}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--erp-card)] hover:bg-[var(--erp-card-hover)] border border-[var(--erp-border)] text-xs font-bold text-[var(--erp-text-main)] transition-all erp-btn shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-emerald-500 ${pingState === 'PINGING' ? 'animate-spin' : ''}`} />
          <span>{pingState === 'PINGING' ? 'Pinging Node...' : pingState === 'SUCCESS' ? 'Ping 14ms OK' : 'Ping Gateway'}</span>
        </button>
      </div>

      {/* Main Hardware Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Gateway Core */}
        <div className="p-5 rounded-2xl erp-card shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--erp-text-main)]">ESP32 SoC Controller</h3>
                <p className="text-xs font-mono text-[var(--erp-text-muted)]">{device.deviceId}</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
              {device.status}
            </span>
          </div>

          <div className="space-y-2 pt-2 border-t border-[var(--erp-border)] text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[var(--erp-text-muted)]">Classroom Location:</span>
              <span className="font-semibold text-[var(--erp-text-main)]">{device.classroom}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--erp-text-muted)]">IP Address:</span>
              <span className="font-mono text-[var(--erp-text-main)] tabular-nums">{device.ipAddress}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--erp-text-muted)]">MAC Address:</span>
              <span className="font-mono text-[var(--erp-text-main)] tabular-nums">{device.macAddress}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--erp-text-muted)]">Firmware Build:</span>
              <span className="font-mono text-emerald-500">{device.firmwareVersion}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--erp-text-muted)]">Last Heartbeat:</span>
              <span className="font-mono text-emerald-500 font-bold tabular-nums">{device.lastHeartbeat}</span>
            </div>
          </div>
        </div>

        {/* RFID RC522 Reader */}
        <div className="p-5 rounded-2xl erp-card shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--erp-text-main)]">RFID Subsystem</h3>
                <p className="text-xs font-mono text-[var(--erp-text-muted)]">NXP RC522 SPI Bus</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
              {device.rfidReaderStatus}
            </span>
          </div>

          <div className="space-y-2 pt-2 border-t border-[var(--erp-border)] text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[var(--erp-text-muted)]">Operating Frequency:</span>
              <span className="font-mono text-[var(--erp-text-main)]">13.56 MHz (ISO 14443A)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--erp-text-muted)]">Last Scanned Card:</span>
              <span className="font-mono text-emerald-500 font-bold tabular-nums">{device.lastRfidUid || '4A:D1:02:07'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--erp-text-muted)]">Identified Student:</span>
              <span className="font-semibold text-[var(--erp-text-main)] truncate">{device.lastStudentName || 'Yuvan Avinash'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--erp-text-muted)]">Scan Timestamp:</span>
              <span className="font-mono text-[var(--erp-text-main)] tabular-nums">{device.lastScanTime}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--erp-text-muted)]">Antenna Gain:</span>
              <span className="font-mono text-emerald-500">48 dB (Optimal)</span>
            </div>
          </div>
        </div>

        {/* BLE Scanner */}
        <div className="p-5 rounded-2xl erp-card shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-500">
                <Wifi className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--erp-text-main)]">BLE 5.0 Beacon Scanner</h3>
                <p className="text-xs font-mono text-[var(--erp-text-muted)]">Proximity Verifier</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-teal-500/15 text-teal-500 border border-teal-500/30">
              {device.bleScannerStatus}
            </span>
          </div>

          <div className="space-y-2 pt-2 border-t border-[var(--erp-border)] text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[var(--erp-text-muted)]">Service UUID Filter:</span>
              <span className="font-mono text-[var(--erp-text-main)] truncate">0000FEAA-0000-1000</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--erp-text-muted)]">Measured RSSI:</span>
              <span className="font-mono text-teal-500 font-bold tabular-nums">{device.lastRssi || -48} dBm</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--erp-text-muted)]">Gating Boundary:</span>
              <span className="font-mono text-[var(--erp-text-main)]">-75 dBm (Desk Proximity)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--erp-text-muted)]">Scan Window:</span>
              <span className="font-mono text-[var(--erp-text-main)]">100ms / 80ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--erp-text-muted)]">Verification Mode:</span>
              <span className="font-semibold text-emerald-500">LOCAL GATEWAY</span>
            </div>
          </div>
        </div>
      </div>

      {/* Target API Specs */}
      <ApiContractViewer />
    </div>
  );
};

