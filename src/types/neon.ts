export type DayOfWeek =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export interface PeriodEntry {
  period: number;
  time: string;
  subject: string;
}

export type WeeklySchedule = Record<DayOfWeek, PeriodEntry[]>;
