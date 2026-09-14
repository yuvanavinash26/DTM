import React from 'react';
import { User } from '../../types/user';
import { logoutUser } from '../../services/authService';
import { BackendStatusIndicator } from '../backend/BackendStatusIndicator';
import { Radio, LogOut, User as UserIcon, Shield, Sparkles } from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  onNavigate: (tab: string) => void;
  onLogout: () => void;
  onSwitchUser?: (identifier: string, role: 'STUDENT' | 'TEACHER') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onLogout,
  onSwitchUser,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3">
      <div className="flex items-center justify-between">
        {/* Left: Brand & Status */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-600/30">
            DTM
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-tight text-white leading-none">
                DTM SMART ATTENDANCE
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                LIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium tracking-wide">
              Smart RFID + BLE Classroom Attendance &bull; Hall 304
            </p>
          </div>
        </div>

        {/* Right: Backend indicator, Quick switcher, Profile */}
        <div className="flex items-center gap-3">
          {/* Flask Backend Indicator */}
          <BackendStatusIndicator />

          {/* Quick Persona Switcher for smooth testing */}
          <div className="hidden sm:flex items-center bg-slate-900/90 rounded-xl p-1 border border-slate-800 text-xs">
            <button
              id="switch-to-teacher"
              onClick={() => onSwitchUser?.('TCH001', 'TEACHER')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                currentUser.role === 'TEACHER'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Teacher
            </button>
            <button
              id="switch-to-yuvan"
              onClick={() => onSwitchUser?.('RA25110030200411', 'STUDENT')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                currentUser.identifier === 'RA25110030200411'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Yuvan
            </button>
            <button
              id="switch-to-krish"
              onClick={() => onSwitchUser?.('RA2511003020043', 'STUDENT')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                currentUser.identifier === 'RA2511003020043'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Krishothaman
            </button>
          </div>

          {/* User Profile Card */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800/80">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-xs overflow-hidden">
              {currentUser.role === 'TEACHER' ? (
                <Shield className="w-4 h-4 text-indigo-400" />
              ) : (
                <UserIcon className="w-4 h-4 text-blue-400" />
              )}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-bold text-white leading-tight">
                {currentUser.name}
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                {currentUser.identifier} &bull; {currentUser.role}
              </div>
            </div>

            <button
              id="btn-logout"
              onClick={onLogout}
              title="Sign Out"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
