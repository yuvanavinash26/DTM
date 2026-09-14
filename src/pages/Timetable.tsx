import React, { useState, useEffect } from 'react';
import { DayOfWeek } from '../types/timetable';
import { OFFICIAL_TIMETABLE } from '../data/timetable';
import { getCurrentClass } from '../services/timetableService';
import { getActiveVenue } from '../services/venueService';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Coffee,
  Utensils,
  Layers,
} from 'lucide-react';

export const Timetable: React.FC = () => {
  const currentClass = getCurrentClass();
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(
    (currentClass.currentDay as DayOfWeek) || 'Monday'
  );
  const [activeVenue, setActiveVenue] = useState<string>(getActiveVenue());

  useEffect(() => {
    const handleVenue = (e: any) => {
      if (e.detail) setActiveVenue(e.detail);
      else setActiveVenue(getActiveVenue());
    };
    window.addEventListener('dtm_venue_change', handleVenue);
    return () => window.removeEventListener('dtm_venue_change', handleVenue);
  }, []);

  const days: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const daySchedule = OFFICIAL_TIMETABLE[selectedDay] || [];

  return (
    <div className="space-y-6 pb-12" id="timetable-page-view">
      {/* Timetable Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl erp-card shadow-md">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Official Academic Schedule
          </span>
          <h2 className="text-2xl font-black tracking-tight text-[var(--erp-text-main)] mt-1">
            Department Lecture Timetable
          </h2>
          <p className="text-xs text-[var(--erp-text-muted)] mt-1">
            Authoritative class schedule for <strong className="text-emerald-500">{activeVenue}</strong> &bull; Semester III (2nd Year) &bull; Section CSE-A &bull; B.Tech Computer Science and Engineering
          </p>
        </div>

        {/* Current Period Live Pill */}
        <div className="flex items-center gap-3 bg-[var(--erp-card-subtle)] px-4 py-2.5 rounded-xl border border-[var(--erp-border)]">
          <Clock className="w-5 h-5 text-emerald-500 shrink-0" />
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--erp-text-faint)]">Current Academic Slot</span>
            <p className="text-xs font-bold text-emerald-500">
              {currentClass.periodLabel} &bull; {currentClass.statusMessage}
            </p>
          </div>
        </div>
      </div>

      {/* Day Selector Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[var(--erp-card-subtle)] border border-[var(--erp-border)] overflow-x-auto">
        {days.map((day) => {
          const isSelected = selectedDay === day;
          const isToday = currentClass.currentDay === day;
          return (
            <button
              key={day}
              id={`tab-day-${day.toLowerCase()}`}
              onClick={() => setSelectedDay(day)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap erp-btn ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-sm font-bold'
                  : 'text-[var(--erp-text-muted)] hover:text-[var(--erp-text-main)] hover:bg-[var(--erp-card-hover)]'
              }`}
            >
              <span>{day}</span>
              {isToday && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Schedule Timeline */}
      <div className="space-y-3">
        {/* Morning Periods 1 and 2 */}
        {daySchedule.slice(0, 2).map((item) => renderPeriodCard(item, currentClass, activeVenue))}

        {/* BREAK SLOT (10:10 - 10:20) */}
        <div className="p-4 rounded-xl bg-[var(--erp-card-subtle)] border border-dashed border-[var(--erp-border)] flex items-center justify-between text-xs text-[var(--erp-text-muted)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Coffee className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-[var(--erp-text-main)]">MORNING BREAK (10:10 AM &ndash; 10:20 AM)</h4>
              <p className="text-[11px] text-[var(--erp-text-muted)]">Biometric scan paused &bull; Campus Refreshment Area</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-md text-[10px] font-mono uppercase bg-[var(--erp-card)] text-amber-500 border border-amber-500/20 font-bold">
            10 min
          </span>
        </div>

        {/* Midday Periods 3 and 4 */}
        {daySchedule.slice(2, 4).map((item) => renderPeriodCard(item, currentClass, activeVenue))}

        {/* LUNCH SLOT (12:00 - 12:40) */}
        <div className="p-4 rounded-xl bg-[var(--erp-card-subtle)] border border-dashed border-[var(--erp-border)] flex items-center justify-between text-xs text-[var(--erp-text-muted)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-[var(--erp-text-main)]">LUNCH RECESS (12:00 PM &ndash; 12:40 PM)</h4>
              <p className="text-[11px] text-[var(--erp-text-muted)]">Biometric scan paused &bull; Student Dining Complex</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-md text-[10px] font-mono uppercase bg-[var(--erp-card)] text-emerald-500 border border-emerald-500/20 font-bold">
            40 min
          </span>
        </div>

        {/* Afternoon Periods 5 through 8 */}
        {daySchedule.slice(4).map((item) => renderPeriodCard(item, currentClass, activeVenue))}
      </div>
    </div>
  );
};

function renderPeriodCard(item: any, currentClass: any, activeVenue: string) {
  const isCurrent =
    currentClass.currentDay === item.day && currentClass.currentPeriod === item.period;
  const isNoClass = item.isNoClass || item.subject === 'NO CLASS';

  if (isNoClass) {
    return (
      <div
        key={`period-${item.period}`}
        className="p-4 rounded-xl bg-[var(--erp-card-subtle)] border border-[var(--erp-border)] flex items-center justify-between opacity-50"
      >
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-[var(--erp-card)] flex items-center justify-center font-mono font-bold text-xs text-[var(--erp-text-faint)]">
            P{item.period}
          </span>
          <div>
            <h4 className="text-xs font-semibold text-[var(--erp-text-muted)]">NO SCHEDULED LECTURE</h4>
            <p className="text-[11px] font-mono text-[var(--erp-text-faint)]">
              {item.startTime} &ndash; {item.endTime} ({item.durationMinutes} min)
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono text-[var(--erp-text-faint)] uppercase font-semibold">Free Period</span>
      </div>
    );
  }

  return (
    <div
      key={`period-${item.period}`}
      className={`p-4 sm:p-5 rounded-xl border transition-all duration-200 shadow-sm erp-card ${
        isCurrent
          ? 'border-emerald-500/60 ring-1 ring-emerald-500/30'
          : 'border-[var(--erp-border)] hover:border-[var(--erp-border-strong)]'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Period & Subject */}
        <div className="flex items-start sm:items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-black text-sm shrink-0 ${
              isCurrent
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-[var(--erp-card-subtle)] text-[var(--erp-text-main)] border border-[var(--erp-border)]'
            }`}
          >
            P{item.period}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm sm:text-base font-extrabold text-[var(--erp-text-main)] tracking-tight">
                {item.subject}
              </h4>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[var(--erp-card-subtle)] text-emerald-500 border border-emerald-500/30">
                {item.subjectCode}
              </span>
              {isCurrent && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  CURRENT ACTIVE
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-[var(--erp-text-muted)]">
              <span className="flex items-center gap-1 font-mono text-[var(--erp-text-main)] tabular-nums">
                <Clock className="w-3.5 h-3.5 text-[var(--erp-text-muted)]" />
                {item.startTime} &ndash; {item.endTime} ({item.durationMinutes} min)
              </span>
              {isCurrent ? (
                <span className="flex items-center gap-1 font-bold text-emerald-500">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{activeVenue} (Live Room)</span>
                </span>
              ) : item.room ? (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[var(--erp-text-muted)]" />
                  <span>{item.room}</span>
                </span>
              ) : null}
              {item.faculty && (
                <span className="flex items-center gap-1 text-[var(--erp-text-muted)]">
                  <User className="w-3.5 h-3.5 text-[var(--erp-text-muted)]" />
                  <span>{item.faculty}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Verification Status */}
        <div className="self-start sm:self-center">
          <span
            className={`text-[11px] font-bold px-3 py-1 rounded-md uppercase tracking-wider ${
              isCurrent
                ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                : 'bg-[var(--erp-card-subtle)] text-[var(--erp-text-muted)] border border-[var(--erp-border)]'
            }`}
          >
            {isCurrent ? 'Attendance Session Live' : 'Scheduled'}
          </span>
        </div>
      </div>
    </div>
  );
}

