import React, { useState } from 'react';
import { User } from '../../types/user';
import { BackendStatusIndicator } from '../backend/BackendStatusIndicator';
import { FacultyUnlockModal } from '../auth/FacultyUnlockModal';
import {
  LogOut,
  User as UserIcon,
  ShieldCheck,
  Building2,
  Sun,
  Moon,
  GraduationCap,
  Sparkles,
  Palette,
  Lock,
} from 'lucide-react';

import { getActiveVenue } from '../../services/venueService';

export type ERPTheme = 'dark' | 'light' | 'sapphire' | 'emerald';

interface NavbarProps {
  currentUser: User;
  onNavigate: (tab: string) => void;
  onLogout: () => void;
  onSwitchUser?: (identifier: string, role: 'STUDENT' | 'TEACHER') => void;
  theme?: ERPTheme;
  onSelectTheme?: (theme: ERPTheme) => void;
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onLogout,
  onSwitchUser,
  theme = 'dark',
  onSelectTheme,
  onToggleTheme,
}) => {
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [currentVenue, setCurrentVenue] = useState(getActiveVenue());

  React.useEffect(() => {
    const handleVenue = () => setCurrentVenue(getActiveVenue());
    window.addEventListener('dtm_venue_change', handleVenue);
    return () => window.removeEventListener('dtm_venue_change', handleVenue);
  }, []);

  const handleTeacherClick = () => {
    if (currentUser.role === 'TEACHER') return;
    // Prompt for teacher password before switching
    setIsUnlockModalOpen(true);
  };

  const handleUnlockSuccess = () => {
    setIsUnlockModalOpen(false);
    onSwitchUser?.('TCH001', 'TEACHER');
  };

  const themes: { id: ERPTheme; label: string; dotColor: string }[] = [
    { id: 'dark', label: 'Executive Dark', dotColor: 'bg-slate-900 border-slate-700' },
    { id: 'light', label: 'Campus Light', dotColor: 'bg-white border-slate-300' },
    { id: 'sapphire', label: 'Nordic Sapphire', dotColor: 'bg-blue-900 border-blue-600' },
    { id: 'emerald', label: 'Emerald Forest', dotColor: 'bg-emerald-900 border-emerald-500' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[var(--erp-card)]/95 backdrop-blur-md border-b border-[var(--erp-border)] px-4 lg:px-7 py-2.5 transition-colors duration-200 shadow-sm">
        <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
          {/* Left: Official University / Academic ERP Branding */}
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 border border-[var(--erp-border-strong)] flex items-center justify-center text-white font-black text-sm shadow-md shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-extrabold tracking-tight text-[var(--erp-text-main)] uppercase leading-none">
                  DTM CAMPUS ERP
                </span>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/15 text-emerald-500 border border-emerald-500/25 tracking-wide uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Biometric Live
                </span>
                <span className="hidden md:inline-flex px-2 py-0.5 rounded-md text-[10px] font-medium bg-[var(--erp-card-subtle)] text-[var(--erp-text-muted)] border border-[var(--erp-border)]">
                  AY 2026-27 &bull; Semester III (2nd Year)
                </span>
              </div>
              <p className="text-[11px] text-[var(--erp-text-muted)] font-medium tracking-normal truncate mt-0.5">
                Dual RFID &amp; BLE Attendance Gateway &bull; {currentVenue}
              </p>
            </div>
          </div>

          {/* Right: Hardware Gateway indicator, Persona Switcher, Theme Switcher, Profile */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Flask Backend Indicator */}
            <BackendStatusIndicator />

            {/* Quick Persona Switcher with Password Gate for Faculty */}
            <div className="hidden lg:flex items-center bg-[var(--erp-card-subtle)] rounded-xl p-1 border border-[var(--erp-border)] text-xs">
              <button
                id="switch-to-teacher"
                onClick={handleTeacherClick}
                title={currentUser.role === 'TEACHER' ? 'Currently on Faculty Portal' : 'Faculty Access (Password Protected)'}
                className={`relative px-2.5 py-1 rounded-lg font-semibold transition-all erp-btn flex items-center gap-1.5 ${
                  currentUser.role === 'TEACHER'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-[var(--erp-text-muted)] hover:text-[var(--erp-text-main)]'
                }`}
              >
                {currentUser.role !== 'TEACHER' && <Lock className="w-3 h-3 opacity-60" />}
                <span>Faculty</span>
              </button>
              <button
                id="switch-to-yuvan"
                onClick={() => onSwitchUser?.('RA2511003020041', 'STUDENT')}
                className={`relative px-2.5 py-1 rounded-lg font-semibold transition-all erp-btn ${
                  currentUser.identifier === 'RA2511003020041'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-[var(--erp-text-muted)] hover:text-[var(--erp-text-main)]'
                }`}
              >
                Yuvan
              </button>
              <button
                id="switch-to-krish"
                onClick={() => onSwitchUser?.('RA2511003020043', 'STUDENT')}
                className={`relative px-2.5 py-1 rounded-lg font-semibold transition-all erp-btn ${
                  currentUser.identifier === 'RA2511003020043'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-[var(--erp-text-muted)] hover:text-[var(--erp-text-main)]'
                }`}
              >
                Krishothaman
              </button>
            </div>

            {/* Multi-Theme Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                id="btn-toggle-erp-theme"
                onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                title="Change ERP Theme Palette"
                className="p-2 rounded-xl text-[var(--erp-text-muted)] hover:text-[var(--erp-text-main)] bg-[var(--erp-card-subtle)] hover:bg-[var(--erp-card-hover)] border border-[var(--erp-border)] transition-all erp-btn flex items-center gap-1.5 text-xs font-semibold"
              >
                <Palette className="w-4 h-4 text-emerald-500" />
                <span className="hidden sm:inline capitalize text-[11px] font-mono">{theme}</span>
              </button>

              {isThemeMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 p-1.5 rounded-2xl erp-card shadow-2xl border border-[var(--erp-border-strong)] z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2.5 py-1 text-[10px] uppercase font-bold text-[var(--erp-text-faint)] tracking-wider border-b border-[var(--erp-border)] mb-1">
                    Select ERP Theme
                  </div>
                  {themes.map((th) => (
                    <button
                      key={th.id}
                      type="button"
                      onClick={() => {
                        onSelectTheme ? onSelectTheme(th.id) : onToggleTheme?.();
                        setIsThemeMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all text-left ${
                        theme === th.id
                          ? 'bg-emerald-500/15 text-emerald-500 font-bold'
                          : 'text-[var(--erp-text-muted)] hover:text-[var(--erp-text-main)] hover:bg-[var(--erp-card-hover)]'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full border shadow-sm shrink-0 ${th.dotColor}`} />
                      <span>{th.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Identity Profile Card */}
            <div className="flex items-center gap-2.5 pl-2.5 border-l border-[var(--erp-border)]">
              <div className="w-8 h-8 rounded-lg bg-[var(--erp-card-subtle)] border border-[var(--erp-border)] flex items-center justify-center text-[var(--erp-text-muted)] font-bold text-xs">
                {currentUser.role === 'TEACHER' ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                ) : (
                  <UserIcon className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <div className="hidden md:block text-left leading-tight">
                <div className="text-xs font-bold text-[var(--erp-text-main)] truncate max-w-[120px]">
                  {currentUser.name}
                </div>
                <div className="text-[10px] font-mono text-[var(--erp-text-muted)]">
                  {currentUser.identifier} &bull; {currentUser.role === 'TEACHER' ? 'Faculty' : 'Student'}
                </div>
              </div>

              <button
                id="btn-logout"
                onClick={onLogout}
                title="Sign Out of ERP Portal"
                className="p-2 rounded-xl text-[var(--erp-text-muted)] hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all erp-btn"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Faculty Unlock Security Challenge Modal */}
      <FacultyUnlockModal
        isOpen={isUnlockModalOpen}
        onClose={() => setIsUnlockModalOpen(false)}
        onSuccess={handleUnlockSuccess}
      />
    </>
  );
};
