import {
  DayOfWeek,
  ClassroomMonitorState,
  TimetablePeriod,
} from '../types/timetable';
import {
  OFFICIAL_TIMETABLE,
  TIME_SLOTS,
  BREAK_SLOT,
  LUNCH_SLOT,
} from '../data/timetable';

/**
 * Returns current Date in Indian Standard Time (Asia/Kolkata)
 */
export function getISTDate(): Date {
  const now = new Date();
  // Format using Asia/Kolkata timezone
  const istString = now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
  return new Date(istString);
}

/**
 * Converts "HH:mm" (24-hour) string to minutes from midnight
 */
export function timeStringToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Converts minutes from midnight to 12-hour formatted time (e.g. "02:36 PM")
 */
export function minutesToFormattedTime(totalMinutes: number): string {
  const hours24 = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const paddedHours = hours12 < 10 ? `0${hours12}` : `${hours12}`;
  const paddedMins = mins < 10 ? `0${mins}` : `${mins}`;
  return `${paddedHours}:${paddedMins} ${period}`;
}

/**
 * Formats a Date object to "hh:mm:ss AM/PM"
 */
export function formatCurrentISTTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

/**
 * Formats a Date object to "hh:mm AM/PM"
 */
export function formatShortISTTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Formats a Date object to "DD MMM YYYY" (e.g. "14 Sep 2026")
 */
export function formatISTDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Gets day of week name in IST
 */
export function getDayOfWeek(date: Date): DayOfWeek {
  const days: DayOfWeek[] = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  return days[date.getDay()];
}

/**
 * Simulated state storage key for presenter / test mode
 */
const SIMULATED_TIME_KEY = 'dtm_simulated_classroom_override';

export interface SimulatedClassroomOverride {
  enabled: boolean;
  day: DayOfWeek;
  period: number; // 1-8, or 0 for break, -1 for lunch
  minutesIntoClass: number; // e.g. 15 minutes in
}

export function getSimulatedOverride(): SimulatedClassroomOverride | null {
  try {
    const raw = localStorage.getItem(SIMULATED_TIME_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  return null;
}

export function setSimulatedOverride(override: SimulatedClassroomOverride | null) {
  if (override && override.enabled) {
    localStorage.setItem(SIMULATED_TIME_KEY, JSON.stringify(override));
  } else {
    localStorage.removeItem(SIMULATED_TIME_KEY);
  }
  window.dispatchEvent(new CustomEvent('dtm_timetable_change'));
}

/**
 * Evaluates the authoritative timetable against IST or simulated time
 */
export function getCurrentClassroomState(): ClassroomMonitorState {
  const sim = getSimulatedOverride();
  const now = getISTDate();

  if (sim && sim.enabled) {
    return calculateSimulatedState(sim, now);
  }

  return calculateRealTimeState(now);
}

function calculateRealTimeState(now: Date): ClassroomMonitorState {
  const currentDay = getDayOfWeek(now);
  const currentDate = formatISTDate(now);
  const currentTime = formatCurrentISTTime(now);

  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentTotalMinutes = hours * 60 + minutes;

  // Check if Weekend
  if (currentDay === 'Saturday' || currentDay === 'Sunday') {
    return {
      currentDay,
      currentDate,
      currentTime,
      currentPeriod: null,
      periodLabel: 'WEEKEND',
      currentSubject: 'NO SCHEDULED CLASSES TODAY',
      subjectCode: '—',
      room: '—',
      startTime: '—',
      endTime: '—',
      attendanceMode: 'INACTIVE',
      reason: 'WEEKEND',
      statusMessage: 'ATTENDANCE INACTIVE',
      timeRemainingMinutes: 0,
      timeRemainingText: 'Campus Closed',
    };
  }

  // Check BREAK (10:10 - 10:20)
  const breakStart = timeStringToMinutes(BREAK_SLOT.startTime);
  const breakEnd = timeStringToMinutes(BREAK_SLOT.endTime);
  if (currentTotalMinutes >= breakStart && currentTotalMinutes < breakEnd) {
    const remaining = breakEnd - currentTotalMinutes;
    return {
      currentDay,
      currentDate,
      currentTime,
      currentPeriod: null,
      periodLabel: 'MORNING BREAK',
      currentSubject: 'SHORT BREAK',
      subjectCode: 'BREAK',
      room: 'Campus Commons',
      startTime: BREAK_SLOT.startTime,
      endTime: BREAK_SLOT.endTime,
      attendanceMode: 'PAUSED',
      reason: 'BREAK',
      statusMessage: 'ATTENDANCE PAUSED',
      timeRemainingMinutes: remaining,
      timeRemainingText: `${remaining} min remaining`,
    };
  }

  // Check LUNCH (12:00 - 12:40)
  const lunchStart = timeStringToMinutes(LUNCH_SLOT.startTime);
  const lunchEnd = timeStringToMinutes(LUNCH_SLOT.endTime);
  if (currentTotalMinutes >= lunchStart && currentTotalMinutes < lunchEnd) {
    const remaining = lunchEnd - currentTotalMinutes;
    return {
      currentDay,
      currentDate,
      currentTime,
      currentPeriod: null,
      periodLabel: 'LUNCH BREAK',
      currentSubject: 'LUNCH RECESS',
      subjectCode: 'LUNCH',
      room: 'Student Dining Hall',
      startTime: LUNCH_SLOT.startTime,
      endTime: LUNCH_SLOT.endTime,
      attendanceMode: 'PAUSED',
      reason: 'LUNCH',
      statusMessage: 'ATTENDANCE PAUSED',
      timeRemainingMinutes: remaining,
      timeRemainingText: `${remaining} min remaining`,
    };
  }

  // Check scheduled class periods 1 through 8
  const daySchedule = OFFICIAL_TIMETABLE[currentDay] || [];

  for (const slot of TIME_SLOTS) {
    const slotStart = timeStringToMinutes(slot.startTime);
    const slotEnd = timeStringToMinutes(slot.endTime);

    if (currentTotalMinutes >= slotStart && currentTotalMinutes < slotEnd) {
      const periodData = daySchedule.find((p) => p.period === slot.period);
      const remaining = slotEnd - currentTotalMinutes;

      if (!periodData || periodData.isNoClass || periodData.subject === 'NO CLASS') {
        return {
          currentDay,
          currentDate,
          currentTime,
          currentPeriod: slot.period,
          periodLabel: slot.label,
          currentSubject: 'NO SCHEDULED CLASS',
          subjectCode: '—',
          room: '—',
          startTime: slot.startTime,
          endTime: slot.endTime,
          attendanceMode: 'INACTIVE',
          reason: 'NO_CLASS',
          statusMessage: 'ATTENDANCE INACTIVE',
          timeRemainingMinutes: remaining,
          timeRemainingText: `${remaining} min remaining`,
        };
      }

      return {
        currentDay,
        currentDate,
        currentTime,
        currentPeriod: slot.period,
        periodLabel: slot.label,
        currentSubject: periodData.subject,
        subjectCode: periodData.subjectCode,
        room: periodData.room || 'Hall 304',
        startTime: slot.startTime,
        endTime: slot.endTime,
        attendanceMode: 'ACTIVE',
        statusMessage: 'ATTENDANCE ACTIVE',
        timeRemainingMinutes: remaining,
        timeRemainingText: `${remaining} min remaining`,
      };
    }
  }

  // Outside college academic hours (Before 08:30 or After 15:50)
  const earliestStart = timeStringToMinutes('08:30');
  const latestEnd = timeStringToMinutes('15:50');

  return {
    currentDay,
    currentDate,
    currentTime,
    currentPeriod: null,
    periodLabel: currentTotalMinutes < earliestStart ? 'PRE-SESSION' : 'SESSION CONCLUDED',
    currentSubject:
      currentTotalMinutes < earliestStart
        ? 'AWAITING COLLEGE COMMENCEMENT'
        : 'CLASSES CONCLUDED FOR TODAY',
    subjectCode: '—',
    room: 'Hall 304',
    startTime: '08:30',
    endTime: '15:50',
    attendanceMode: 'INACTIVE',
    reason: 'OUTSIDE_HOURS',
    statusMessage: 'ATTENDANCE INACTIVE',
    timeRemainingMinutes: 0,
    timeRemainingText:
      currentTotalMinutes < earliestStart ? 'Starts at 08:30 AM' : 'Day Concluded',
  };
}

function calculateSimulatedState(
  sim: SimulatedClassroomOverride,
  now: Date
): ClassroomMonitorState {
  const currentDay = sim.day;
  const currentDate = '14 Sep 2026';

  // Break Simulation
  if (sim.period === 0) {
    const elapsed = Math.min(Math.max(sim.minutesIntoClass, 0), BREAK_SLOT.durationMinutes);
    const remaining = BREAK_SLOT.durationMinutes - elapsed;
    return {
      currentDay,
      currentDate,
      currentTime: minutesToFormattedTime(
        timeStringToMinutes(BREAK_SLOT.startTime) + elapsed
      ),
      currentPeriod: null,
      periodLabel: 'MORNING BREAK',
      currentSubject: 'SHORT BREAK',
      subjectCode: 'BREAK',
      room: 'Campus Commons',
      startTime: BREAK_SLOT.startTime,
      endTime: BREAK_SLOT.endTime,
      attendanceMode: 'PAUSED',
      reason: 'BREAK',
      statusMessage: 'ATTENDANCE PAUSED',
      timeRemainingMinutes: remaining,
      timeRemainingText: `${remaining} min remaining`,
      isSimulated: true,
    };
  }

  // Lunch Simulation
  if (sim.period === -1) {
    const elapsed = Math.min(Math.max(sim.minutesIntoClass, 0), LUNCH_SLOT.durationMinutes);
    const remaining = LUNCH_SLOT.durationMinutes - elapsed;
    return {
      currentDay,
      currentDate,
      currentTime: minutesToFormattedTime(
        timeStringToMinutes(LUNCH_SLOT.startTime) + elapsed
      ),
      currentPeriod: null,
      periodLabel: 'LUNCH BREAK',
      currentSubject: 'LUNCH RECESS',
      subjectCode: 'LUNCH',
      room: 'Student Dining Hall',
      startTime: LUNCH_SLOT.startTime,
      endTime: LUNCH_SLOT.endTime,
      attendanceMode: 'PAUSED',
      reason: 'LUNCH',
      statusMessage: 'ATTENDANCE PAUSED',
      timeRemainingMinutes: remaining,
      timeRemainingText: `${remaining} min remaining`,
      isSimulated: true,
    };
  }

  // Normal Period 1 to 8 Simulation
  const slot = TIME_SLOTS.find((s) => s.period === sim.period) || TIME_SLOTS[6]; // Default Period 7
  const daySchedule = OFFICIAL_TIMETABLE[currentDay] || [];
  const periodData = daySchedule.find((p) => p.period === slot.period);

  const elapsed = Math.min(Math.max(sim.minutesIntoClass, 0), slot.durationMinutes);
  const remaining = slot.durationMinutes - elapsed;
  const currentMin = timeStringToMinutes(slot.startTime) + elapsed;

  if (!periodData || periodData.isNoClass || periodData.subject === 'NO CLASS') {
    return {
      currentDay,
      currentDate,
      currentTime: minutesToFormattedTime(currentMin),
      currentPeriod: slot.period,
      periodLabel: slot.label,
      currentSubject: 'NO SCHEDULED CLASS',
      subjectCode: '—',
      room: '—',
      startTime: slot.startTime,
      endTime: slot.endTime,
      attendanceMode: 'INACTIVE',
      reason: 'NO_CLASS',
      statusMessage: 'ATTENDANCE INACTIVE',
      timeRemainingMinutes: remaining,
      timeRemainingText: `${remaining} min remaining`,
      isSimulated: true,
    };
  }

  return {
    currentDay,
    currentDate,
    currentTime: minutesToFormattedTime(currentMin),
    currentPeriod: slot.period,
    periodLabel: slot.label,
    currentSubject: periodData.subject,
    subjectCode: periodData.subjectCode,
    room: periodData.room || 'Hall 304',
    startTime: slot.startTime,
    endTime: slot.endTime,
    attendanceMode: 'ACTIVE',
    statusMessage: 'ATTENDANCE ACTIVE',
    timeRemainingMinutes: remaining,
    timeRemainingText: `${remaining} min remaining`,
    isSimulated: true,
  };
}
