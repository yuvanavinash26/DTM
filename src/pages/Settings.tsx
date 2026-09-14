import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sliders, Save, Check, RefreshCw, Cpu, Radio, ShieldCheck, Building2 } from 'lucide-react';
import { resetAllDataToDefault } from '../services/attendanceService';
import { getActiveVenue, setActiveVenue } from '../services/venueService';

export const Settings: React.FC = () => {
  const [classroom, setClassroom] = useState(getActiveVenue());
  const [subject, setSubject] = useState('Design Thinking and Methodology');
  const [rssiThreshold, setRssiThreshold] = useState(-75);
  const [bleTimeoutSeconds, setBleTimeoutSeconds] = useState(45);
  const [gracePeriodMinutes, setGracePeriodMinutes] = useState(15);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveVenue(classroom);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all attendance records, BLE telemetry states, and device registers to default institutional state?')) {
      resetAllDataToDefault();
      setResetSuccess(true);
      setTimeout(() => {
        setResetSuccess(false);
        window.location.reload();
      }, 800);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto space-y-6 pb-12"
      id="settings-view"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-white/10">
              <Sliders className="w-3 h-3" />
              System Calibration
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Classroom Hardware &amp; Verification Settings
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure ESP32 gate parameters, BLE RSSI attenuation boundaries, and session metadata.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Classroom & Lecture Config */}
        <div className="erp-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-2.5 border-b border-white/5 pb-3">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">Active Session Parameters</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                Classroom / Hall ID
              </label>
              <input
                type="text"
                value={classroom}
                onChange={(e) => setClassroom(e.target.value)}
                className="w-full bg-slate-950/70 border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                Active Course Title
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-950/70 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors font-medium"
              />
            </div>
          </div>
        </div>

        {/* Hardware & BLE Signal Calibration */}
        <div className="erp-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-2.5 border-b border-white/5 pb-3">
            <Cpu className="w-4 h-4 text-teal-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">BLE Proximity &amp; ESP32 Gate Calibration</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                RSSI Gating Threshold (dBm)
              </label>
              <input
                type="number"
                value={rssiThreshold}
                onChange={(e) => setRssiThreshold(Number(e.target.value))}
                className="w-full bg-slate-950/70 border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <p className="text-[11px] text-slate-500">Signals weaker than this are rejected as outside classroom</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                BLE Window Timeout (Sec)
              </label>
              <input
                type="number"
                value={bleTimeoutSeconds}
                onChange={(e) => setBleTimeoutSeconds(Number(e.target.value))}
                className="w-full bg-slate-950/70 border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <p className="text-[11px] text-slate-500">Maximum delay allowed between RFID tap and phone beacon</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                Lecture Grace Period (Min)
              </label>
              <input
                type="number"
                value={gracePeriodMinutes}
                onChange={(e) => setGracePeriodMinutes(Number(e.target.value))}
                className="w-full bg-slate-950/70 border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <p className="text-[11px] text-slate-500">Permissible student delay before marked as LATE</p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            type="submit"
            id="btn-save-settings"
            className="erp-btn inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950/40"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-200" />
                <span>Configuration Applied</span>
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
            className="erp-btn inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-rose-950/30 border border-white/10 hover:border-rose-500/30 text-slate-400 hover:text-rose-300 text-xs font-semibold transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resetSuccess ? 'animate-spin text-rose-400' : ''}`} />
            <span>{resetSuccess ? 'Restoring System Defaults...' : 'Restore Default Institutional Seed Data'}</span>
          </button>
        </div>
      </form>
    </motion.div>
  );
};
