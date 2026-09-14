import React, { useState } from 'react';
import { Sliders, Save, Check, RefreshCw, Cpu, Radio, ShieldCheck } from 'lucide-react';
import { resetAllDataToDefault } from '../services/attendanceService';

export const Settings: React.FC = () => {
  const [classroom, setClassroom] = useState('Hall C-304');
  const [subject, setSubject] = useState('Digital Technology & Management');
  const [rssiThreshold, setRssiThreshold] = useState(-75);
  const [bleTimeoutSeconds, setBleTimeoutSeconds] = useState(45);
  const [gracePeriodMinutes, setGracePeriodMinutes] = useState(15);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all attendance and device states to default institutional state?')) {
      resetAllDataToDefault();
      setResetSuccess(true);
      setTimeout(() => {
        setResetSuccess(false);
        window.location.reload();
      }, 800);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12" id="settings-view">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Classroom &amp; Verification Settings
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure ESP32 threshold bounds, signal calibration, and session metadata
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Classroom & Lecture Config */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white tracking-tight">Session Parameters</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold uppercase tracking-wider text-[11px]">
                Classroom / Hall ID
              </label>
              <input
                type="text"
                value={classroom}
                onChange={(e) => setClassroom(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold uppercase tracking-wider text-[11px]">
                Current Active Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Hardware & BLE Signal Calibration */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white tracking-tight">BLE Proximity &amp; ESP32 Calibration</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold uppercase tracking-wider text-[11px]">
                RSSI Gating Threshold (dBm)
              </label>
              <input
                type="number"
                value={rssiThreshold}
                onChange={(e) => setRssiThreshold(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[10px] text-slate-400">Signals below this are flagged as outside classroom</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold uppercase tracking-wider text-[11px]">
                BLE Window Timeout (Sec)
              </label>
              <input
                type="number"
                value={bleTimeoutSeconds}
                onChange={(e) => setBleTimeoutSeconds(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[10px] text-slate-400">Time window to detect student beacon after RFID tap</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold uppercase tracking-wider text-[11px]">
                Entry Grace Period (Min)
              </label>
              <input
                type="number"
                value={gracePeriodMinutes}
                onChange={(e) => setGracePeriodMinutes(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[10px] text-slate-400">Allowed delay before marked as late entry</p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            type="submit"
            id="btn-save-settings"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Configuration Saved</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Parameters</span>
              </>
            )}
          </button>

          <button
            type="button"
            id="btn-reset-defaults"
            onClick={handleResetData}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-800/60 text-slate-400 hover:text-rose-300 text-xs font-semibold transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resetSuccess ? 'animate-spin' : ''}`} />
            <span>{resetSuccess ? 'Resetting Records...' : 'Restore Default Institutional Seed Data'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
