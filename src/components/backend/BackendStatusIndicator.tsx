import React, { useState } from 'react';
import { useFlaskAttendance } from '../../hooks/useFlaskAttendance';
import {
  setFlaskEndpoint,
  resetFlaskEndpoint,
  getFlaskEndpoint,
} from '../../services/flaskAttendanceService';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Server,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Settings,
  X,
  Radio,
} from 'lucide-react';

export const BackendStatusIndicator: React.FC = () => {
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customEndpoint, setCustomEndpoint] = useState(endpoint);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  const handleSaveEndpoint = (e: React.FormEvent) => {
    e.preventDefault();
    setFlaskEndpoint(customEndpoint);
    setSaveFeedback('Endpoint updated');
    triggerRetry();
    setTimeout(() => setSaveFeedback(null), 2000);
  };

  const handleReset = () => {
    resetFlaskEndpoint();
    setCustomEndpoint(getFlaskEndpoint());
    setSaveFeedback('Reset to default (http://localhost:8000/api/attendance)');
    triggerRetry();
    setTimeout(() => setSaveFeedback(null), 2500);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {isConnected ? (
          /* Connected State: Green Pill */
          <button
            type="button"
            id="backend-status-connected"
            onClick={() => setIsModalOpen(true)}
            title={`Backend Connected to ${endpoint}. Click for live payload details.`}
            className="group flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all cursor-pointer shadow-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span className="tracking-tight font-medium">Backend Connected</span>
            <span className="text-[10px] font-mono text-emerald-300/80 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-500/20 hidden sm:inline">
              :8000
            </span>
          </button>
        ) : (
          /* Offline / Error State: Amber/Rose Pill with Quick Retry */
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              id="backend-status-offline"
              onClick={() => setIsModalOpen(true)}
              title={errorMessage || 'Backend Offline. Click for setup guide.'}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 transition-all cursor-pointer shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
              <span className="tracking-tight font-medium">Backend Offline</span>
            </button>

            <button
              type="button"
              id="btn-retry-backend-poll"
              onClick={triggerRetry}
              disabled={isRetrying}
              title="Retry connection to Flask backend"
              className="p-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-amber-400 ${
                  isRetrying ? 'animate-spin' : ''
                }`}
              />
            </button>
          </div>
        )}
      </div>

      {/* Diagnostics / Settings Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
            id="backend-diagnostic-modal"
          >
            {/* Modal Header */}
            <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    isConnected
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {isConnected ? (
                    <Wifi className="w-4 h-4" />
                  ) : (
                    <WifiOff className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Flask Backend Gateway Status
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Polling interval: 2 seconds
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs">
              {/* Status Banner */}
              <div
                className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                  isConnected
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                }`}
              >
                {isConnected ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="font-bold text-sm text-white">
                    {isConnected ? 'Backend Connected' : 'Backend Offline / Unreachable'}
                  </h4>
                  <p className="mt-0.5 text-xs opacity-90 leading-relaxed">
                    {isConnected
                      ? `Successfully receiving live Bluetooth attendance updates from ${endpoint}.`
                      : errorMessage ||
                        'Unable to reach Flask server at http://localhost:8000/api/attendance.'}
                  </p>
                </div>
              </div>

              {/* Live Payload Stream (if available) */}
              {lastData && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold uppercase tracking-wider text-slate-400">
                      Live Flask Payload (Auto-updated)
                    </span>
                    <span className="font-mono text-slate-400">
                      Last check: {lastChecked}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                      <span className="text-slate-400">Student:</span>
                      <p className="font-bold text-white mt-0.5">{lastData.student}</p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                      <span className="text-slate-400">Bluetooth Status:</span>
                      <p
                        className={`font-bold mt-0.5 ${
                          lastData.bluetooth === 'PRESENT'
                            ? 'text-emerald-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {lastData.bluetooth}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                      <span className="text-slate-400">RSSI Proximity:</span>
                      <p className="font-bold text-cyan-300 font-mono mt-0.5">
                        {lastData.rssi !== null && lastData.rssi !== undefined
                          ? `${lastData.rssi} dBm`
                          : 'null (Not detected)'}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                      <span className="text-slate-400">Last Seen:</span>
                      <p className="font-bold text-indigo-300 font-mono mt-0.5">
                        {lastSeenFormatted}
                      </p>
                    </div>
                  </div>

                  {lastData.phone_address && (
                    <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800 flex items-center justify-between font-mono">
                      <span className="text-slate-400">Phone BLE MAC:</span>
                      <span className="text-slate-200">{lastData.phone_address}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Troubleshooting Guide for Offline State */}
              {!isConnected && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-indigo-400" />
                    <h5 className="font-bold text-white">How to connect your Flask backend:</h5>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
                    <li>
                      Ensure Flask is running on port 8000:{' '}
                      <code className="text-indigo-300 font-mono bg-slate-900 px-1 py-0.5 rounded">
                        app.run(port=8000, host="0.0.0.0")
                      </code>
                    </li>
                    <li>
                      Enable CORS so browser fetches are allowed:
                      <pre className="mt-1 bg-slate-900/90 text-slate-200 p-2 rounded border border-slate-800 font-mono text-[10px] overflow-x-auto">
{`from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enables cross-origin requests

@app.route("/api/attendance", methods=["GET"])
def get_attendance():
    return jsonify({
        "student": "Yuvan Avinash",
        "phone_address": "7B:E0:C6:3A:DD:BE",
        "bluetooth": "PRESENT",
        "attendance": "PRESENT",
        "rssi": -69,
        "last_seen": 1770000000
    })`}
                      </pre>
                    </li>
                  </ol>
                </div>
              )}

              {/* Endpoint configuration form */}
              <form onSubmit={handleSaveEndpoint} className="space-y-2 pt-2 border-t border-slate-800">
                <label className="block text-slate-400 font-semibold">
                  API Endpoint URL:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={customEndpoint}
                    onChange={(e) => setCustomEndpoint(e.target.value)}
                    placeholder="http://localhost:8000/api/attendance"
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors shrink-0"
                  >
                    Save &amp; Test
                  </button>
                </div>
                {saveFeedback && (
                  <p className="text-[11px] text-emerald-400 font-medium">
                    {saveFeedback}
                  </p>
                )}
              </form>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                Reset to default URL
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={triggerRetry}
                  disabled={isRetrying}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 text-indigo-400 ${
                      isRetrying ? 'animate-spin' : ''
                    }`}
                  />
                  <span>{isRetrying ? 'Testing...' : 'Test Connection'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
