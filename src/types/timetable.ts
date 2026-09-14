export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export type AttendanceMode = 'ACTIVE' | 'PAUSED' | 'INACTIVE';

export type InactiveReason = 'BREAK' | 'LUNCH' | 'NO_CLASS' | 'OUTSIDE_HOURS' | 'WEEKEND';

export interface TimeSlot {
  period: number;
  label: string;
  startTime: string; // "08:30"
  endTime: string;   // "09:20"
  durationMinutes: number;
}

export interface TimetablePeriod {
  period: number;
  day: DayOfWeek;
  subject: string;
  subjectCode: string;
  room?: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  isBreak?: boolean;
  isLunch?: boolean;
  isNoClass?: boolean;
  faculty?: string;
}

export interface ClassroomMonitorState {
  currentDay: DayOfWeek;
  currentDate: string;
  currentTime: string;
  currentPeriod: number | null;
  periodLabel: string;
  currentSubject: string;
  subjectCode: string;
  room: string;
  startTime: string;
  endTime: string;
  attendanceMode: AttendanceMode;
  reason?: InactiveReason;
  statusMessage: string;
  timeRemainingMinutes: number;
  timeRemainingText: string;
  isSimulated?: boolean;
}
