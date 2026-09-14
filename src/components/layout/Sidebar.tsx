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
  Calendar,
  User as UserIcon,
  Server,
  Activity,
} from 'lucide-react';

interface SidebarProps {
  role: UserRole;
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ role, currentTab, onTabChange }) => {
  const teacherSections = [
    {
      group: 'ACADEMIC PORTAL',
      items: [
        { id: 'dashboard', label: 'Faculty Dashboard', icon: LayoutDashboard },
        { id: 'live', label: 'Live Biometrics', icon: Radio, badge: 'LIVE' },
        { id: 'timetable', label: 'Class Timetable', icon: Calendar },
        { id: 'students', label: 'Student Roster', icon: Users },
      ],
    },
    {
      group: 'AUDIT & HARDWARE',
      items: [
        { id: 'logs', label: 'Attendance Audit', icon: FileSpreadsheet },
        { id: 'device', label: 'ESP32 Hardware Node', icon: Cpu },
      ],
    },
    {
      group: 'ADMINISTRATION',
      items: [
        { id: 'reports', label: 'Analytics & Reports', icon: BarChart3 },
        { id: 'settings', label: 'System Settings', icon: Sliders },
      ],
    },
  ];

  const studentSections = [
    {
      group: 'STUDENT SERVICES',
      items: [
        { id: 'dashboard', label: 'Academic Overview', icon: LayoutDashboard },
        { id: 'my-attendance', label: 'Biometric Status', icon: CheckCircle2 },
        { id: 'timetable', label: 'Class Timetable', icon: Calendar },
        { id: 'profile', label: 'Student Dossier', icon: UserIcon },
      ],
    },
  ];

  const sections = role === 'TEACHER' ? teacherSections : studentSections;

  return (
    <aside className="w-full md:w-64 shrink-0 bg-[var(--erp-card-subtle)] md:border-r border-b md:border-b-0 border-[var(--erp-border)] p-3 md:p-4 flex md:flex-col justify-between overflow-x-auto transition-colors">
      <div className="flex md:flex-col gap-5 w-full">
        {sections.map((sec, secIdx) => (
          <div key={secIdx} className="space-y-1.5 w-full">
            <div className="hidden md:block px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[var(--erp-text-faint)]">
              {sec.group}
            </div>

            <div className="flex md:flex-col gap-1 w-full">
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-item-${item.id}`}
                    onClick={() => onTabChange(item.id)}
                    className={`relative flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all whitespace-nowrap erp-btn ${
                      isActive
                        ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                        : 'text-[var(--erp-text-muted)] hover:text-[var(--erp-text-main)] hover:bg-[var(--erp-card-hover)]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-white' : 'text-[var(--erp-text-muted)]'
                        }`}
                      />
                      <span className="text-left leading-none">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded tracking-wide ${
                          isActive
                            ? 'bg-emerald-700 text-white'
                            : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Hardware Node Status Card in Sidebar */}
      <div className="hidden md:block mt-6 p-3.5 rounded-xl bg-[var(--erp-card)] border border-[var(--erp-border)] text-xs shadow-sm">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--erp-text-faint)] flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-emerald-400" />
            Hardware Node
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Online
          </span>
        </div>
        <p className="text-xs font-mono font-bold text-[var(--erp-text-main)]">
          DTM-ESP32-01
        </p>
        <p className="text-[10px] text-[var(--erp-text-muted)] mt-0.5 font-medium">
          Dual RC522 RFID + BLE 5.0 Beacon
        </p>
      </div>
    </aside>
  );
};
