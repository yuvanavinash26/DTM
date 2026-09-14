import React, { useState } from 'react';
import { UserRole } from '../types/user';
import { loginUser } from '../services/authService';
import { Shield, GraduationCap, ArrowRight, Lock, UserCheck, Sparkles, Check } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [role, setRole] = useState<UserRole>('TEACHER');
  const [identifier, setIdentifier] = useState('TCH001');
  const [password, setPassword] = useState('teacher123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    setError(null);
    if (newRole === 'TEACHER') {
      setIdentifier('TCH001');
      setPassword('teacher123');
    } else {
      setIdentifier('RA25110030200411');
      setPassword('password123');
    }
  };

  const handleQuickFill = (id: string, pw: string, chosenRole: UserRole) => {
    setRole(chosenRole);
    setIdentifier(id);
    setPassword(pw);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await loginUser(identifier, password, role);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setError(res.error || 'Authentication failed. Please check credentials.');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 space-y-7">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 shadow-xl shadow-indigo-600/30 text-white font-black text-2xl tracking-tight mb-2">
            DTM
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            DTM SMART ATTENDANCE
          </h1>
          <p className="text-sm text-slate-400 font-medium">
            Smart RFID + BLE Classroom Attendance
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl p-6 sm:p-8 backdrop-blur-md space-y-6">
          {/* Role Switcher */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Select Role
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
              <button
                type="button"
                id="role-btn-teacher"
                onClick={() => handleRoleChange('TEACHER')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  role === 'TEACHER'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Teacher</span>
              </button>
              <button
                type="button"
                id="role-btn-student"
                onClick={() => handleRoleChange('STUDENT')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  role === 'STUDENT'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Student</span>
              </button>
            </div>
          </div>

          {/* Quick Credential Presets */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Quick Login Presets:
            </span>
            <div className="flex flex-wrap gap-1.5 text-xs">
              <button
                type="button"
                id="preset-teacher"
                onClick={() => handleQuickFill('TCH001', 'teacher123', 'TEACHER')}
                className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${
                  identifier === 'TCH001' && role === 'TEACHER'
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                Class Teacher (TCH001)
              </button>
              <button
                type="button"
                id="preset-yuvan"
                onClick={() => handleQuickFill('RA25110030200411', 'password123', 'STUDENT')}
                className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${
                  identifier === 'RA25110030200411' && role === 'STUDENT'
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                Yuvan Avinash
              </button>
              <button
                type="button"
                id="preset-krish"
                onClick={() => handleQuickFill('RA2511003020043', 'password123', 'STUDENT')}
                className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${
                  identifier === 'RA2511003020043' && role === 'STUDENT'
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                Krishothaman
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                {role === 'TEACHER' ? 'Teacher ID' : 'Student Register Number'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="input-identifier"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={role === 'TEACHER' ? 'e.g. TCH001' : 'e.g. RA25110030200411'}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Password
                </label>
                <span className="text-[11px] text-slate-400">Institutional SSO</span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  id="input-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              id="btn-submit-login"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 mt-2"
            >
              <span>{loading ? 'Authenticating...' : `Sign In as ${role === 'TEACHER' ? 'Teacher' : 'Student'}`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* System Footer */}
          <div className="pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">
            <p>Department of Computer Science &amp; Engineering</p>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">ESP32 Hardware Gateway v2.4</p>
          </div>
        </div>
      </div>
    </div>
  );
};
