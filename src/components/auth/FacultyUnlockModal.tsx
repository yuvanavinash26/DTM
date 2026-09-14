import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Lock, X, ArrowRight, AlertCircle, KeyRound } from 'lucide-react';
import { verifyTeacherPassword, getTeacherCredentials } from '../../services/authService';

interface FacultyUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const FacultyUnlockModal: React.FC<FacultyUnlockModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const teacherCreds = getTeacherCredentials();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!password) {
      setError('Please enter the Faculty password.');
      return;
    }

    if (verifyTeacherPassword(password)) {
      setPassword('');
      onSuccess();
    } else {
      setError('Invalid password. Access restricted to authorized faculty.');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-md p-6 rounded-2xl erp-card shadow-2xl space-y-5 border border-[var(--erp-border-strong)] relative"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[var(--erp-text-muted)] hover:text-[var(--erp-text-main)] p-1.5 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--erp-text-main)] tracking-tight">
                Faculty Access Control
              </h3>
              <p className="text-xs text-[var(--erp-text-muted)]">
                Institutional ID: <strong className="font-mono text-[var(--erp-text-main)]">{teacherCreds.identifier}</strong>
              </p>
            </div>
          </div>

          <p className="text-xs text-[var(--erp-text-muted)] leading-relaxed">
            Attendance management, biometric telemetry triggers, and student grade modifications are restricted to verified faculty instructors.
          </p>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--erp-text-faint)] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-500" />
                Faculty Password
              </label>
              <input
                type="password"
                autoFocus
                placeholder="Enter password (default: teacher123)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[var(--erp-card-subtle)] border border-[var(--erp-border)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--erp-text-main)] font-mono focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="erp-btn px-4 py-2 rounded-xl text-xs font-semibold text-[var(--erp-text-muted)] hover:text-[var(--erp-text-main)] bg-[var(--erp-card-subtle)] border border-[var(--erp-border)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="btn-confirm-faculty-unlock"
                className="erp-btn inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Verify &amp; Unlock</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
