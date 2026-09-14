import React, { useState } from 'react';
import { UserRole } from '../types/user';
import { loginUser, registerOrUpdateTeacher, getTeacherCredentials } from '../services/authService';
import { ShieldCheck, GraduationCap, ArrowRight, Lock, Sun, Moon, UserPlus, LogIn, KeyRound } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
  theme?: 'dark' | 'light' | 'sapphire' | 'emerald';
  onToggleTheme?: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, theme = 'dark', onToggleTheme }) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [role, setRole] = useState<UserRole>('TEACHER');
  const [identifier, setIdentifier] = useState('TCH001');
  const [password, setPassword] = useState('teacher123');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Faculty Registration / Password Creation fields
  const [signupName, setSignupName] = useState('Class Teacher');
  const [signupId, setSignupId] = useState('TCH001');
  const [signupDept, setSignupDept] = useState('B.Tech Computer Science and Engineering');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    setError(null);
    if (newRole === 'TEACHER') {
      const creds = getTeacherCredentials();
      setIdentifier(creds.identifier);
      setPassword(creds.password);
    } else {
      setIdentifier('RA2511003020041');
      setPassword('password123');
    }
  };

  const handleQuickFill = (id: string, pw: string, chosenRole: UserRole) => {
    setAuthMode('signin');
    setRole(chosenRole);
    setIdentifier(id);
    setPassword(pw);
    setError(null);
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await loginUser(identifier, password, role);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setError(res.error || 'Authentication failed. Please verify institutional credentials.');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!signupPassword || signupPassword.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    const res = registerOrUpdateTeacher(signupName, signupId, signupPassword, signupDept);
    if (res.success && res.user) {
      setSuccessMsg('Faculty credentials updated and encrypted for future sessions!');
      setTimeout(() => {
        onLoginSuccess(res.user);
      }, 700);
    } else {
      setError(res.error || 'Failed to create Faculty credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--erp-bg)] text-[var(--erp-text-main)] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden transition-colors">
      {/* Top right theme toggle */}
      {onToggleTheme && (
        <div className="absolute top-6 right-6 z-20">
          <button
            type="button"
            id="btn-login-theme-toggle"
            onClick={onToggleTheme}
            className="p-2.5 rounded-xl bg-[var(--erp-card)] hover:bg-[var(--erp-card-hover)] border border-[var(--erp-border)] text-[var(--erp-text-muted)] hover:text-[var(--erp-text-main)] transition-all erp-btn shadow-sm"
            title="Toggle ERP Theme"
          >
            {theme === 'light' ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>
        </div>
      )}

      <div className="w-full max-w-md relative z-10 space-y-7">
        {/* University Crest & Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 border border-[var(--erp-border-strong)] shadow-lg text-white font-black text-2xl tracking-tight mb-2">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--erp-text-main)] uppercase">
            DTM CAMPUS ERP
          </h1>
          <p className="text-xs text-[var(--erp-text-muted)] font-medium tracking-wide">
            Biometric RFID + BLE Dual-Factor Attendance Gateway
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl erp-card shadow-2xl p-6 sm:p-8 backdrop-blur-md space-y-6">
          {/* Sign In vs Sign Up Tabs */}
          <div className="flex border-b border-[var(--erp-border)] pb-2 gap-4 text-xs font-bold">
            <button
              type="button"
              id="tab-auth-signin"
              onClick={() => { setAuthMode('signin'); setError(null); }}
              className={`pb-2 border-b-2 transition-all flex items-center gap-1.5 ${
                authMode === 'signin'
                  ? 'border-emerald-500 text-emerald-500'
                  : 'border-transparent text-[var(--erp-text-muted)] hover:text-[var(--erp-text-main)]'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Enterprise Sign In</span>
            </button>
            <button
              type="button"
              id="tab-auth-signup"
              onClick={() => { setAuthMode('signup'); setError(null); }}
              className={`pb-2 border-b-2 transition-all flex items-center gap-1.5 ${
                authMode === 'signup'
                  ? 'border-emerald-500 text-emerald-500'
                  : 'border-transparent text-[var(--erp-text-muted)] hover:text-[var(--erp-text-main)]'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Faculty Sign Up / Set Password</span>
            </button>
          </div>

          {authMode === 'signin' ? (
            <>
              {/* Portal Selector */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--erp-text-faint)]">
                  Select Enterprise Portal
                </label>
                <div className="grid grid-cols-2 gap-2 bg-[var(--erp-card-subtle)] p-1 rounded-xl border border-[var(--erp-border)]">
                  <button
                    type="button"
                    id="role-btn-teacher"
                    onClick={() => handleRoleChange('TEACHER')}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all erp-btn ${
                      role === 'TEACHER'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-[var(--erp-text-muted)] hover:text-[var(--erp-text-main)]'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Faculty Portal</span>
                  </button>
                  <button
                    type="button"
                    id="role-btn-student"
                    onClick={() => handleRoleChange('STUDENT')}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all erp-btn ${
                      role === 'STUDENT'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-[var(--erp-text-muted)] hover:text-[var(--erp-text-main)]'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Student Portal</span>
                  </button>
                </div>
              </div>

              {/* Quick Credential Presets */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-[var(--erp-text-faint)] uppercase tracking-wider">
                  Quick Demo Accounts:
                </span>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  <button
                    type="button"
                    id="preset-teacher"
                    onClick={() => handleQuickFill('TCH001', 'teacher123', 'TEACHER')}
                    className={`px-2.5 py-1 rounded-md border text-xs font-semibold transition-all erp-btn ${
                      identifier === 'TCH001' && role === 'TEACHER'
                        ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
                        : 'bg-[var(--erp-card-subtle)] text-[var(--erp-text-muted)] border-[var(--erp-border)] hover:border-[var(--erp-border-strong)]'
                    }`}
                  >
                    Faculty (TCH001)
                  </button>
                  <button
                    type="button"
                    id="preset-yuvan"
                    onClick={() => handleQuickFill('RA2511003020041', 'password123', 'STUDENT')}
                    className={`px-2.5 py-1 rounded-md border text-xs font-semibold transition-all erp-btn ${
                      identifier === 'RA2511003020041' && role === 'STUDENT'
                        ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
                        : 'bg-[var(--erp-card-subtle)] text-[var(--erp-text-muted)] border-[var(--erp-border)] hover:border-[var(--erp-border-strong)]'
                    }`}
                  >
                    Yuvan (Student)
                  </button>
                  <button
                    type="button"
                    id="preset-krish"
                    onClick={() => handleQuickFill('RA2511003020043', 'password123', 'STUDENT')}
                    className={`px-2.5 py-1 rounded-md border text-xs font-semibold transition-all erp-btn ${
                      identifier === 'RA2511003020043' && role === 'STUDENT'
                        ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
                        : 'bg-[var(--erp-card-subtle)] text-[var(--erp-text-muted)] border-[var(--erp-border)] hover:border-[var(--erp-border-strong)]'
                    }`}
                  >
                    Krishothaman (Student)
                  </button>
                </div>
              </div>

              {/* Sign In Form */}
              <form onSubmit={handleSignInSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-500 text-xs font-medium">
                    {error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--erp-text-muted)]">
                    {role === 'TEACHER' ? 'Faculty ID Number' : 'Student University Roll No'}
                  </label>
                  <input
                    type="text"
                    id="input-identifier"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={role === 'TEACHER' ? 'e.g. TCH001' : 'e.g. RA2511003020041'}
                    required
                    className="w-full bg-[var(--erp-card-subtle)] border border-[var(--erp-border)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--erp-text-main)] font-mono placeholder:text-[var(--erp-text-faint)] focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--erp-text-muted)]">
                      Enterprise Password
                    </label>
                    <span className="text-[11px] text-[var(--erp-text-faint)]">SSO Protected</span>
                  </div>
                  <input
                    type="password"
                    id="input-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-[var(--erp-card-subtle)] border border-[var(--erp-border)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--erp-text-main)] placeholder:text-[var(--erp-text-faint)] focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  id="btn-submit-login"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all erp-btn disabled:opacity-50 mt-2"
                >
                  <span>{loading ? 'Authenticating with ERP...' : `Access ${role === 'TEACHER' ? 'Faculty Portal' : 'Student Portal'}`}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            /* Faculty Sign Up / Password Creation Form */
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
                Create or update your authorized Faculty credentials. Passwords are saved persistently for all future visits.
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-500 text-xs font-medium">
                  {error}
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
                  {successMsg}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--erp-text-muted)]">
                  Faculty Name
                </label>
                <input
                  type="text"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="e.g. Dr. R. Kavitha"
                  required
                  className="w-full bg-[var(--erp-card-subtle)] border border-[var(--erp-border)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--erp-text-main)] focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--erp-text-muted)]">
                    Faculty ID
                  </label>
                  <input
                    type="text"
                    value={signupId}
                    onChange={(e) => setSignupId(e.target.value)}
                    placeholder="e.g. TCH001"
                    required
                    className="w-full bg-[var(--erp-card-subtle)] border border-[var(--erp-border)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--erp-text-main)] font-mono focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--erp-text-muted)]">
                    Department
                  </label>
                  <input
                    type="text"
                    value={signupDept}
                    onChange={(e) => setSignupDept(e.target.value)}
                    placeholder="e.g. CSE"
                    required
                    className="w-full bg-[var(--erp-card-subtle)] border border-[var(--erp-border)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--erp-text-main)] focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--erp-text-muted)]">
                  Create New Password
                </label>
                <input
                  type="password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="Choose secure faculty password"
                  required
                  className="w-full bg-[var(--erp-card-subtle)] border border-[var(--erp-border)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--erp-text-main)] focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--erp-text-muted)]">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  required
                  className="w-full bg-[var(--erp-card-subtle)] border border-[var(--erp-border)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--erp-text-main)] focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                id="btn-submit-signup"
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all erp-btn mt-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>Save Password &amp; Enter Portal</span>
              </button>
            </form>
          )}

          {/* Institutional Footer */}
          <div className="pt-4 border-t border-[var(--erp-border)] text-center text-xs text-[var(--erp-text-muted)]">
            <p>Department of Computer Science and Engineering</p>
            <p className="text-[10px] font-mono text-[var(--erp-text-faint)] mt-0.5">Dual RFID + BLE Biometric Gateway &bull; v2.4 Enterprise &bull; Semester III (2nd Year)</p>
          </div>
        </div>
      </div>
    </div>
  );
};
