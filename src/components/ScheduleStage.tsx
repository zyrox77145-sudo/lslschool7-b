import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  DAYS_OF_WEEK,
  MAX_SUBJECT_LENGTH,
  MAX_TIME_LENGTH,
} from '../constants/schedule';
import { DayOfWeek, PeriodEntry, WeeklySchedule } from '../types/neon';
import {
  PixelArrowLeftIcon,
  PixelCheckIcon,
  PixelClockIcon,
  PixelEditIcon,
  PixelLockIcon,
  PixelPlusIcon,
  PixelResetIcon,
  PixelShieldCheckIcon,
  PixelTrashIcon,
} from './PixelIcons';

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
        duration: reducedMotion ? 0 : 0.58,
        delay: reducedMotion ? 0 : 0.14,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="pointer-events-none fixed inset-0 z-20 flex items-center justify-center px-4 py-6"
    >
      <section
        aria-label="7 - B Class Schedule"
        className="pixel-panel pointer-events-auto relative flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-cyan-400/25 bg-[#0a1020] px-6 py-4">
          <div>
            <h1
              className="font-display text-lg font-bold tracking-tight text-slate-100 sm:text-xl"
              style={{ textShadow: '2px 2px 0 #020308' }}
            >
              7 - B Class Schedule
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-slate-400">
              <span>LSL School</span>
              <span aria-hidden="true">·</span>
              <span>Monday to Sunday</span>
              <span aria-hidden="true">·</span>
              <span>8 Periods</span>
              <span aria-hidden="true">·</span>
              {isCreator ? (
                <span className="inline-flex items-center gap-1.5 font-medium text-cyan-300">
                  <PixelShieldCheckIcon className="h-3.5 w-3.5" />
                  Editor Mode
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 font-medium text-emerald-400">
                  <PixelLockIcon className="h-3.5 w-3.5" />
                  View Only
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onBackToLogo}
            className="pixel-btn-sm flex min-h-10 items-center gap-2 border-2 border-slate-500/50 bg-[#12192d] px-3.5 py-2 font-display text-xs font-bold text-slate-100 hover:border-cyan-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 whitespace-nowrap shrink-0"
          >
            <PixelArrowLeftIcon className="h-3.5 w-3.5 text-cyan-400" />
            <span>LSL School</span>
          </button>
        </div>

        {/* Crisp 7-Column Pixel Day Grid (Zero Scrollbars, Zero Clipping) */}
        <div className="border-b-2 border-white/10 bg-[#070b15] px-6 py-3">
          <div
            role="tablist"
            aria-label="Days of the week"
            className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-7"
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
                  className={`pixel-btn-sm flex flex-col items-center justify-center border-2 px-2 py-2 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                    active
                      ? 'border-cyan-200 bg-cyan-500 text-slate-950'
                      : 'border-white/12 bg-[#0d1426] text-slate-300 hover:border-cyan-400/50 hover:bg-[#131d36] hover:text-white'
                  }`}
                >
                  <span className="font-display text-[11px] font-bold leading-tight whitespace-nowrap">
                    {day}
                  </span>
                  <span
                    className={`font-mono-tabular mt-1 text-[10px] leading-none ${
                      active ? 'font-bold text-slate-900' : 'text-slate-400'
                    }`}
                  >
                    {day === 'Sunday' && count === 0 ? 'Day off' : `${count}/8`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Period Rows (1 - 8) or Giant Pixel "Day off" View */}
        <div className="pixel-scroll flex-1 overflow-y-auto px-6 py-4">
          {selectedDay === 'Sunday' && scheduledCount === 0 && !showSundayEditor ? (
            <div className="pixel-grid-bg flex min-h-[320px] flex-col items-center justify-center border-2 border-cyan-400/25 bg-[#060913] px-6 py-12 text-center">
              <div
                className="font-display text-5xl font-bold tracking-tight text-cyan-300 sm:text-6xl"
                style={{ textShadow: '4px 4px 0 #083344, -2px -2px 0 #164e63' }}
              >
                Day off
              </div>
              <p className="mt-4 text-base font-medium text-slate-300">
                Sunday · No classes scheduled
              </p>
              {isCreator && (
                <button
                  type="button"
                  onClick={() => setShowSundayEditor(true)}
                  className="pixel-btn-sm mt-6 flex items-center gap-2 border-2 border-slate-400/40 bg-[#12192d] px-4 py-2 font-display text-xs font-bold text-slate-200 hover:border-cyan-400 hover:text-white"
                >
                  <PixelPlusIcon className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Add Sunday classes</span>
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y-2 divide-white/10 border-2 border-white/15 bg-[#060913]">
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
                      className="flex flex-wrap items-center gap-3 bg-[#10182c] px-4 py-3"
                    >
                      <span className="font-mono-tabular w-8 border border-cyan-400/40 bg-cyan-500/15 py-1 text-center text-xs font-bold text-cyan-300">
                        {String(entry.period).padStart(2, '0')}
                      </span>

                      <input
                        type="text"
                        maxLength={MAX_TIME_LENGTH}
                        value={draftTime}
                        onChange={(e) => setDraftTime(e.target.value)}
                        placeholder="08:30 - 09:15"
                        aria-label={`Period ${entry.period} time`}
                        className="pixel-input font-mono-tabular w-36 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none"
                      />

                      <input
                        type="text"
                        maxLength={MAX_SUBJECT_LENGTH}
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
                        className="pixel-input min-w-[180px] flex-1 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
                      />

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="submit"
                          className="pixel-btn-sm flex items-center gap-1.5 border-2 border-cyan-300 bg-cyan-500 px-3 py-2 font-display text-[11px] font-bold text-slate-950 hover:bg-cyan-400 whitespace-nowrap"
                        >
                          <PixelCheckIcon className="h-3.5 w-3.5" />
                          <span>Save</span>
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="pixel-btn-sm border-2 border-slate-500/50 bg-[#12192d] px-3 py-2 font-display text-[11px] font-bold text-slate-200 hover:border-slate-300 hover:text-white whitespace-nowrap"
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
                    className="group flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-[#0d1426]"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-4">
                      <span className="font-mono-tabular w-8 shrink-0 border border-white/15 bg-[#0c1222] py-1 text-center text-xs font-bold text-cyan-300">
                        {String(entry.period).padStart(2, '0')}
                      </span>

                      <span className="font-mono-tabular w-32 shrink-0 text-xs text-slate-400">
                        {entry.time}
                      </span>

                      {hasSubject ? (
                        <span className="truncate text-base font-semibold text-slate-100">
                          {entry.subject}
                        </span>
                      ) : isCreator ? (
                        <button
                          type="button"
                          onClick={() => startEditing(entry)}
                          className="flex items-center gap-1.5 text-left text-sm font-medium text-slate-400 transition-colors hover:text-cyan-300"
                        >
                          <PixelPlusIcon className="h-3.5 w-3.5 text-cyan-400" />
                          <span>Add class</span>
                        </button>
                      ) : (
                        <span className="text-sm text-slate-500">
                          No class scheduled
                        </span>
                      )}
                    </div>

                    {isCreator && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => startEditing(entry)}
                          aria-label={`Edit period ${entry.period}`}
                          className="pixel-btn-sm flex items-center gap-1.5 border-2 border-white/15 bg-[#12192d] px-2.5 py-1.5 font-display text-[11px] font-bold text-slate-200 hover:border-cyan-400 hover:text-white whitespace-nowrap"
                        >
                          <PixelEditIcon className="h-3.5 w-3.5 text-cyan-400" />
                          <span>Edit</span>
                        </button>

                        {hasSubject && (
                          <button
                            type="button"
                            onClick={() => onUpdatePeriod(selectedDay, entry.period, entry.time, '')}
                            aria-label={`Clear period ${entry.period}`}
                            className="pixel-btn-sm flex items-center justify-center border-2 border-white/15 bg-[#12192d] p-1.5 text-slate-300 hover:border-pink-400 hover:text-pink-300"
                          >
                            <PixelTrashIcon className="h-3.5 w-3.5" />
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
        <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-white/10 bg-[#070b15] px-6 py-3.5">
          <span className="text-sm font-medium text-slate-400">
            {selectedDay} ·{' '}
            {scheduledCount === 0
              ? 'No classes scheduled'
              : `${scheduledCount} of 8 periods scheduled`}
          </span>

          {isCreator && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleSyncAllTimes}
                className="pixel-btn-sm flex items-center gap-1.5 border-2 border-white/15 bg-[#12192d] px-3 py-1.5 font-display text-[11px] font-bold text-slate-200 hover:border-cyan-400 hover:text-white whitespace-nowrap"
              >
                {timesSynced ? (
                  <PixelCheckIcon className="h-3.5 w-3.5 text-cyan-400" />
                ) : (
                  <PixelClockIcon className="h-3.5 w-3.5 text-cyan-400" />
                )}
                <span>{timesSynced ? 'Times synced' : 'Apply times to all days'}</span>
              </button>

              {selectedDay === 'Monday' && (
                <button
                  type="button"
                  onClick={onRestoreMonday}
                  className="pixel-btn-sm flex items-center gap-1.5 border-2 border-white/15 bg-[#12192d] px-3 py-1.5 font-display text-[11px] font-bold text-slate-200 hover:border-slate-300 hover:text-white whitespace-nowrap"
                >
                  <PixelResetIcon className="h-3.5 w-3.5 text-slate-300" />
                  <span>Restore Monday</span>
                </button>
              )}

              {scheduledCount > 0 && (
                <button
                  type="button"
                  onClick={() => onClearDay(selectedDay)}
                  className="pixel-btn-sm flex items-center gap-1.5 border-2 border-white/15 bg-[#12192d] px-3 py-1.5 font-display text-[11px] font-bold text-slate-200 hover:border-pink-400 hover:text-pink-300 whitespace-nowrap"
                >
                  <PixelTrashIcon className="h-3.5 w-3.5 text-pink-400" />
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
