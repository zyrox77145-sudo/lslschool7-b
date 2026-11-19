import { DayOfWeek, PeriodEntry, WeeklySchedule } from '../types/neon';

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const DEFAULT_PERIOD_TIMES: string[] = [
  '08:30 - 09:15',
  '09:25 - 10:10',
  '10:20 - 11:05',
  '11:20 - 12:05',
  '13:05 - 13:50',
  '14:00 - 14:45',
  '14:55 - 15:30',
  '15:40 - 16:30',
];

const LEGACY_DEFAULT_TIMES: string[] = [
  '08:30 - 09:15',
  '09:25 - 10:10',
  '10:20 - 11:05',
  '11:20 - 12:05',
  '12:15 - 13:00',
  '13:30 - 14:15',
  '14:25 - 15:10',
  '15:20 - 16:05',
];

export const MONDAY_DEFAULT_SUBJECTS: string[] = [
  'Mathematics',
  'Mathematics',
  'IT',
  'IT',
  'Geography',
  'Physics',
  'English Language',
  'English Language',
];

export function createEmptyDaySchedule(): PeriodEntry[] {
  return DEFAULT_PERIOD_TIMES.map((time, index) => ({
    period: index + 1,
    time,
    subject: '',
  }));
}

export function createMondayDefaultSchedule(): PeriodEntry[] {
  return DEFAULT_PERIOD_TIMES.map((time, index) => ({
    period: index + 1,
    time,
    subject: MONDAY_DEFAULT_SUBJECTS[index] ?? '',
  }));
}

export function createInitialWeeklySchedule(): WeeklySchedule {
  return {
    Monday: createMondayDefaultSchedule(),
    Tuesday: createEmptyDaySchedule(),
    Wednesday: createEmptyDaySchedule(),
    Thursday: createEmptyDaySchedule(),
    Friday: createEmptyDaySchedule(),
    Saturday: createEmptyDaySchedule(),
    Sunday: createEmptyDaySchedule(),
  };
}

export const SCHEDULE_STORAGE_KEY = 'lsl_school_7b_schedule_v1';

export function loadSavedSchedule(): WeeklySchedule {
  const fallback = createInitialWeeklySchedule();
  try {
    const raw = localStorage.getItem(SCHEDULE_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<WeeklySchedule>;
    const hydrated = { ...fallback };
    for (const day of DAYS_OF_WEEK) {
      const dayEntries = parsed[day];
      if (Array.isArray(dayEntries) && dayEntries.length === 8) {
        hydrated[day] = dayEntries.map((entry, idx) => {
          const rawTime =
            typeof entry?.time === 'string' && entry.time.trim().length > 0
              ? entry.time.trim()
              : DEFAULT_PERIOD_TIMES[idx];
          // Upgrade untouched legacy default times so all days match the unified bell schedule
          const normalizedTime =
            rawTime === LEGACY_DEFAULT_TIMES[idx]
              ? DEFAULT_PERIOD_TIMES[idx]
              : rawTime;
          return {
            period: idx + 1,
            time: normalizedTime,
            subject: typeof entry?.subject === 'string' ? entry.subject : '',
          };
        });
      }
    }
    return hydrated;
  } catch {
    return fallback;
  }
}
