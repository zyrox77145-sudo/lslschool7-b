import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Clock,
  Lock,
  Pencil,
  Plus,
  RotateCcw,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { motion } from 'motion/react';
import { DAYS_OF_WEEK } from '../constants/schedule';
import { DayOfWeek, PeriodEntry, WeeklySchedule } from '../types/neon';

interface ScheduleStageProps {
  schedule: WeeklySchedule;
  isCreator: boolean;
  reducedMotion: boolean;
  onBackToLogo: () => void;
  onUpdatePeriod: (day: DayOfWeek, period: number, time: string, subject: string) => void;
  onSyncTimesToAllDays: (sourceDay: DayOfWeek) => void;
  onClearDay: (day: DayOfWeek) => void;
  onRestoreMonday: () => void;
}

export const ScheduleStage: React.FC<ScheduleStageProps> = ({
  schedule,
  isCreator,
  reducedMotion,
  onBackToLogo,
  onUpdatePeriod,
  onSyncTimesToAllDays,
  onClearDay,
  onRestoreMonday,
}) => {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Monday');
  const [editingPeriod, setEditingPeriod] = useState<number | null>(null);
  const [draftTime, setDraftTime] = useState('');
  const [draftSubject, setDraftSubject] = useState('');
  const [timesSynced, setTimesSynced] = useState(false);
  const [showSundayEditor, setShowSundayEditor] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && editingPeriod === null) {
        onBackToLogo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingPeriod, onBackToLogo]);

  const dayEntries: PeriodEntry[] = schedule[selectedDay];
  const scheduledCount = dayEntries.filter((e) => e.subject.trim().length > 0).length;

  const startEditing = (entry: PeriodEntry) => {
    if (!isCreator) return;
    setEditingPeriod(entry.period);
    setDraftTime(entry.time);
    setDraftSubject(entry.subject);
  };

  const commitEdit = (period: number) => {
    if (!isCreator) return;
    const cleanTime = draftTime.trim() || schedule[selectedDay][period - 1].time;
    const cleanSubject = draftSubject.trim();
    onUpdatePeriod(selectedDay, period, cleanTime, cleanSubject);
    setEditingPeriod(null);
  };

  const cancelEdit = () => {
    setEditingPeriod(null);
  };

  const handleSelectDay = (day: DayOfWeek) => {
    setSelectedDay(day);
    setEditingPeriod(null);
    setShowSundayEditor(false);
  };

  const handleSyncAllTimes = () => {
    if (!isCreator) return;
    onSyncTimesToAllDays(selectedDay);
    setTimesSynced(true);
    window.setTimeout(() => setTimesSynced(false), 1800);
  };

  return (
    <motion.div
      initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -72 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -56 }}
      transition={{
        duration: reducedMotion ? 0 : 0.62,
        delay: reducedMotion ? 0 : 0.14,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="pointer-events-none fixed inset-0 z-20 flex items-center justify-center px-4 py-6"
    >
      <section
        aria-label="7 - B Class Schedule"
        className="pointer-events-auto flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-cyan-400/25 bg-[#0b0f1a]/92 shadow-[0_0_48px_rgba(34,211,238,0.14)]"
      >
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-6 py-4">
          <div>
            <h1 className="font-display text-xl font-semibold tracking-tight text-slate-100">
              7 - B Class Schedule
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span>LSL School</span>
              <span aria-hidden="true">·</span>
              <span>Monday to Sunday</span>
              <span aria-hidden="true">·</span>
              <span>8 Periods</span>
              <span aria-hidden="true">·</span>
              {isCreator ? (
                <span className="inline-flex items-center gap-1 text-cyan-400 font-medium">
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  Editor Mode
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                  <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                  View Only
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onBackToLogo}
            className="flex min-h-10 items-center gap-2 rounded-lg border border-white/12 bg-white/5 px-3.5 py-2 text-xs font-medium text-slate-200 transition-colors hover:border-cyan-400/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-cyan-400" aria-hidden="true" />
            <span>LSL School</span>
          </button>
        </div>

        {/* Clean 7-Column Day Grid (Zero Scrollbars, Zero Clipping) */}
        <div className="border-b border-white/10 bg-[#080b14]/90 px-6 py-3">
          <div
            role="tablist"
            aria-label="Days of the week"
            className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 md:grid-cols-7"
          >
            {DAYS_OF_WEEK.map((day) => {
              const active = selectedDay === day;
              const count = schedule[day].filter((p) => p.subject.trim().length > 0).length;
              return (
                <button
                  key={day}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => handleSelectDay(day)}
                  className={`flex flex-col items-center justify-center rounded-lg border px-2 py-2 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                    active
                      ? 'border-cyan-400 bg-cyan-500 text-slate-950'
                      : 'border-white/6 bg-white/[0.03] text-slate-300 hover:border-white/15 hover:bg-white/[0.07] hover:text-white'
                  }`}
                >
                  <span className="text-xs font-semibold leading-tight whitespace-nowrap">
                    {day}
                  </span>
                  <span
                    className={`font-mono-tabular mt-0.5 text-[11px] leading-none ${
                      active ? 'text-slate-900/80 font-medium' : 'text-slate-500'
                    }`}
                  >
                    {day === 'Sunday' && count === 0 ? 'Day off' : `${count}/8`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Period Rows (1 - 8) or Large Sunday "Day off" View */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {selectedDay === 'Sunday' && scheduledCount === 0 && !showSundayEditor ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-white/10 bg-[#080b14]/95 px-6 py-12 text-center">
              <div
                className="font-display text-5xl sm:text-6xl font-bold tracking-tight text-cyan-300"
                style={{ textShadow: '0 0 28px rgba(34, 211, 238, 0.35)' }}
              >
                Day off
              </div>
              <p className="mt-3 text-sm text-slate-400">
                Sunday · No classes scheduled
              </p>
              {isCreator && (
                <button
                  type="button"
                  onClick={() => setShowSundayEditor(true)}
                  className="mt-6 flex items-center gap-1.5 rounded-lg border border-white/12 bg-white/5 px-3.5 py-2 text-xs font-medium text-slate-300 transition-colors hover:border-cyan-400/50 hover:text-white"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Add Sunday classes</span>
                </button>
              )}
            </div>
          ) : (
          <div className="divide-y divide-white/8 rounded-xl border border-white/10 bg-[#080b14]/95">
            {dayEntries.map((entry) => {
              const isEditing = isCreator && editingPeriod === entry.period;
              const hasSubject = entry.subject.trim().length > 0;

              if (isEditing) {
                return (
                  <form
                    key={entry.period}
                    onSubmit={(e) => {
                      e.preventDefault();
                      commitEdit(entry.period);
                    }}
                    className="flex flex-wrap items-center gap-3 bg-[#101729] px-4 py-3"
                  >
                    <span className="font-mono-tabular w-7 text-xs font-medium text-cyan-400">
                      {String(entry.period).padStart(2, '0')}
                    </span>

                    <input
                      type="text"
                      value={draftTime}
                      onChange={(e) => setDraftTime(e.target.value)}
                      placeholder="08:30 - 09:15"
                      aria-label={`Period ${entry.period} time`}
                      className="font-mono-tabular w-32 rounded-lg border border-white/15 bg-[#070a12] px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
                    />

                    <input
                      type="text"
                      value={draftSubject}
                      onChange={(e) => setDraftSubject(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          e.stopPropagation();
                          cancelEdit();
                        }
                      }}
                      placeholder="Enter subject name (e.g. Mathematics)"
                      aria-label={`Period ${entry.period} subject`}
                      autoFocus
                      className="min-w-[180px] flex-1 rounded-lg border border-white/15 bg-[#070a12] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
                    />

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="submit"
                        className="flex items-center gap-1 rounded-lg bg-cyan-500 px-3 py-2 text-xs font-semibold text-slate-950 transition-colors hover:bg-cyan-400 whitespace-nowrap"
                      >
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Save</span>
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="rounded-lg border border-white/12 px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:text-white whitespace-nowrap"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                );
              }

              return (
                <div
                  key={entry.period}
                  className="group flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-white/[0.03]"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    <span className="font-mono-tabular w-7 shrink-0 text-xs font-medium text-slate-400">
                      {String(entry.period).padStart(2, '0')}
                    </span>

                    <span className="font-mono-tabular w-28 shrink-0 text-xs text-slate-400">
                      {entry.time}
                    </span>

                    {hasSubject ? (
                      <span className="truncate text-sm font-medium text-slate-100">
                        {entry.subject}
                      </span>
                    ) : isCreator ? (
                      <button
                        type="button"
                        onClick={() => startEditing(entry)}
                        className="flex items-center gap-1.5 text-left text-sm text-slate-500 transition-colors hover:text-cyan-300"
                      >
                        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Add class</span>
                      </button>
                    ) : (
                      <span className="text-sm text-slate-500">
                        No class scheduled
                      </span>
                    )}
                  </div>

                  {isCreator && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => startEditing(entry)}
                        aria-label={`Edit period ${entry.period}`}
                        className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-cyan-400/50 hover:text-white whitespace-nowrap"
                      >
                        <Pencil className="h-3 w-3" aria-hidden="true" />
                        <span>Edit</span>
                      </button>

                      {hasSubject && (
                        <button
                          type="button"
                          onClick={() => onUpdatePeriod(selectedDay, entry.period, entry.time, '')}
                          aria-label={`Clear period ${entry.period}`}
                          className="flex items-center justify-center rounded-lg border border-white/10 bg-white/5 p-1.5 text-slate-400 transition-colors hover:border-pink-400/50 hover:text-pink-300"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-[#080b14]/90 px-6 py-3.5">
          <span className="text-xs text-slate-400">
            {selectedDay} · {scheduledCount === 0 ? 'No classes scheduled' : `${scheduledCount} of 8 periods scheduled`}
          </span>

          {isCreator && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleSyncAllTimes}
                className="flex items-center gap-1.5 rounded-lg border border-white/12 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-cyan-400/40 hover:text-white whitespace-nowrap"
              >
                {timesSynced ? (
                  <Check className="h-3.5 w-3.5 text-cyan-400" aria-hidden="true" />
                ) : (
                  <Clock className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                )}
                <span>{timesSynced ? 'Times synced' : 'Apply times to all days'}</span>
              </button>

              {selectedDay === 'Monday' && (
                <button
                  type="button"
                  onClick={onRestoreMonday}
                  className="flex items-center gap-1.5 rounded-lg border border-white/12 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-white/25 hover:text-white whitespace-nowrap"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Restore Monday</span>
                </button>
              )}

              {scheduledCount > 0 && (
                <button
                  type="button"
                  onClick={() => onClearDay(selectedDay)}
                  className="flex items-center gap-1.5 rounded-lg border border-white/12 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-pink-400/40 hover:text-pink-300 whitespace-nowrap"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Clear {selectedDay}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </motion.div>
  );
};
