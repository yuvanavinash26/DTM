import React, { useState } from 'react';
import { Terminal, Copy, Check, Code2 } from 'lucide-react';

export const ApiContractViewer: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const rfidEndpoint = `POST /api/attendance/rfid
Content-Type: application/json

{
  "rfidUid": "4A:D1:02:07",
  "deviceId": "DTM-ESP32-01",
  "timestamp": "2026-09-14T10:42:31+05:30"
}`;

  const bleEndpoint = `POST /api/attendance/ble
Content-Type: application/json

{
  "studentId": "RA2511003020041",
  "deviceId": "DTM_PHONE",
  "rssi": -48,
  "verified": true,
  "timestamp": "2026-09-14T10:42:40+05:30"
}`;

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="erp-card p-5 rounded-2xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              ESP32 &amp; BLE Gateway Ingress Contract
            </h3>
            <p className="text-xs text-slate-400">
              Target API schema for hardware microcontroller verification payloads
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-md bg-slate-950/60 text-slate-300 border border-white/10 self-start sm:self-auto">
          REST / Flask :8000 Endpoint Contract
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* RFID Contract */}
        <div className="rounded-xl bg-slate-950/40 border border-white/5 p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-emerald-400">
              1. RFID Scan Ingress Endpoint
            </span>
            <button
              onClick={() => copyToClipboard(rfidEndpoint, 'rfid')}
              className="erp-btn text-slate-400 hover:text-white p-1 rounded transition-colors text-xs flex items-center gap-1"
            >
              {copiedSection === 'rfid' ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
          <pre className="text-[11px] font-mono text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-white/5 overflow-x-auto leading-relaxed">
            {rfidEndpoint}
          </pre>
          <p className="text-[11px] text-slate-400">
            ESP32 scans card &rarr; resolves <code className="text-emerald-300 font-mono">4A:D1:02:07</code> &rarr; sets RFID verified and initiates BLE beacon window.
          </p>
        </div>

        {/* BLE Contract */}
        <div className="rounded-xl bg-slate-950/40 border border-white/5 p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-teal-400">
              2. BLE Proximity Ingress Endpoint
            </span>
            <button
              onClick={() => copyToClipboard(bleEndpoint, 'ble')}
              className="erp-btn text-slate-400 hover:text-white p-1 rounded transition-colors text-xs flex items-center gap-1"
            >
              {copiedSection === 'ble' ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
          <pre className="text-[11px] font-mono text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-white/5 overflow-x-auto leading-relaxed">
            {bleEndpoint}
          </pre>
          <p className="text-[11px] text-slate-400">
            BLE scanner measures RSSI &rarr; validates student device in classroom proximity &rarr; marks final attendance as <code className="text-emerald-300 font-mono font-bold">PRESENT</code>.
          </p>
        </div>
      </div>
    </div>
  );
};
