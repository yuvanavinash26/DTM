import React from 'react';
import { UserRole } from '../../types/user';
import {
  LayoutDashboard,
  Radio,
  Users,
  FileSpreadsheet,
  Cpu,
  BarChart3,
  Sliders,
  CheckCircle2,
  Clock,
  User as UserIcon,
} from 'lucide-react';

interface SidebarProps {
  role: UserRole;
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ role, currentTab, onTabChange }) => {
  const teacherNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'live', label: 'Live Attendance', icon: Radio },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'logs', label: 'Attendance', icon: FileSpreadsheet },
    { id: 'device', label: 'Device Monitor', icon: Cpu },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Sliders },
  ];

  const studentNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'my-attendance', label: 'My Attendance', icon: CheckCircle2 },
    { id: 'history', label: 'Attendance History', icon: Clock },
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];

  const items = role === 'TEACHER' ? teacherNav : studentNav;

  return (
    <aside className="w-full md:w-64 shrink-0 bg-slate-950/60 md:border-r border-b md:border-b-0 border-slate-800/80 p-3 md:p-4 flex md:flex-col justify-between overflow-x-auto">
      <div className="flex md:flex-col gap-1.5 w-full">
        <div className="hidden md:block px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Navigation
        </div>

        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Gateway connectivity indicator */}
      <div className="hidden md:block mt-6 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold text-slate-400">Hardware Node</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>
        <p className="text-xs font-mono font-bold text-white">DTM-ESP32-01</p>
        <p className="text-[10px] text-slate-400 mt-0.5">Dual RFID RC522 + BLE 5.0</p>
      </div>
    </aside>
  );
};
