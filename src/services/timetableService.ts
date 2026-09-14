import {
  DayOfWeek,
  TimetablePeriod,
  ClassroomMonitorState,
} from '../types/timetable';
import { OFFICIAL_TIMETABLE, TIME_SLOTS } from '../data/timetable';
import {
  getCurrentClassroomState,
  getSimulatedOverride,
  setSimulatedOverride,
  SimulatedClassroomOverride,
} from '../utils/timeUtils';

export async function getTimetable(day?: DayOfWeek): Promise<Record<DayOfWeek, TimetablePeriod[]> | TimetablePeriod[]> {
  if (day) {
    return OFFICIAL_TIMETABLE[day] || [];
  }
  return OFFICIAL_TIMETABLE;
}

export function getCurrentClass(): ClassroomMonitorState {
  return getCurrentClassroomState();
}

export function isAttendanceActive(): boolean {
  const current = getCurrentClassroomState();
  return current.attendanceMode === 'ACTIVE';
}

export function setClassroomSimulation(override: SimulatedClassroomOverride | null): void {
  setSimulatedOverride(override);
}

export function getClassroomSimulation(): SimulatedClassroomOverride | null {
  return getSimulatedOverride();
}

export { TIME_SLOTS };
