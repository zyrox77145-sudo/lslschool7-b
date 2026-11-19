import { useCallback, useEffect, useState } from 'react';
import { Bookmark, Check, LogOut } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { FloatingScheduleTrigger } from './components/FloatingScheduleTrigger';
import { ScheduleStage } from './components/ScheduleStage';
import { StudentLoginGate } from './components/StudentLoginGate';
import {
  AuthenticatedStudent,
  clearSavedStudent,
  loadSavedStudent,
  persistSavedStudent,
} from './constants/roster';
import {
  createMondayDefaultSchedule,
  DAYS_OF_WEEK,
  loadSavedSchedule,
  SCHEDULE_STORAGE_KEY,
} from './constants/schedule';
import { NeonSceneCanvas } from './three/NeonSceneCanvas';
import { DayOfWeek, WeeklySchedule } from './types/neon';

export default function App() {
  const [savedStudent, setSavedStudent] = useState<AuthenticatedStudent | null>(() =>
    loadSavedStudent(),
  );
  const [currentStudent, setCurrentStudent] = useState<AuthenticatedStudent | null>(
    () => loadSavedStudent(),
  );
  const [schedule, setSchedule] = useState<WeeklySchedule>(() => loadSavedSchedule());
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(schedule));
    } catch {
      // Ignore storage quota errors gracefully
    }
  }, [schedule]);

  const handleLogin = useCallback(
    (student: AuthenticatedStudent, saveForFuture: boolean) => {
      setCurrentStudent(student);
      if (saveForFuture) {
        persistSavedStudent(student);
        setSavedStudent(student);
      } else {
        clearSavedStudent();
        setSavedStudent(null);
      }
    },
    [],
  );

  const handleSaveCurrentStudent = useCallback(() => {
    if (!currentStudent) return;
    persistSavedStudent(currentStudent);
    setSavedStudent(currentStudent);
  }, [currentStudent]);

  const handleSignOut = useCallback(() => {
    clearSavedStudent();
    setSavedStudent(null);
    setCurrentStudent(null);
    setIsScheduleOpen(false);
  }, []);

  const handleUpdatePeriod = useCallback(
    (day: DayOfWeek, period: number, time: string, subject: string) => {
      if (!currentStudent?.isCreator) return;
      setSchedule((prev) => ({
        ...prev,
        [day]: prev[day].map((entry) =>
          entry.period === period ? { ...entry, time, subject } : entry,
        ),
      }));
    },
    [currentStudent],
  );

  const handleSyncTimesToAllDays = useCallback(
    (sourceDay: DayOfWeek) => {
      if (!currentStudent?.isCreator) return;
      setSchedule((prev) => {
        const sourceTimes = prev[sourceDay].map((entry) => entry.time);
        const next = { ...prev };
        for (const day of DAYS_OF_WEEK) {
          next[day] = prev[day].map((entry, idx) => ({
            ...entry,
            time: sourceTimes[idx] ?? entry.time,
          }));
        }
        return next;
      });
    },
    [currentStudent],
  );

  const handleClearDay = useCallback(
    (day: DayOfWeek) => {
      if (!currentStudent?.isCreator) return;
      setSchedule((prev) => ({
        ...prev,
        [day]: prev[day].map((entry) => ({ ...entry, subject: '' })),
      }));
    },
    [currentStudent],
  );

  const handleRestoreMonday = useCallback(() => {
    if (!currentStudent?.isCreator) return;
    setSchedule((prev) => {
      const defaultMonday = createMondayDefaultSchedule();
      return {
        ...prev,
        Monday: prev.Monday.map((entry, idx) => ({
          ...entry,
          subject: defaultMonday[idx].subject,
        })),
      };
    });
  }, [currentStudent]);

  const isSaved =
    savedStudent !== null &&
    currentStudent !== null &&
    savedStudent.firstName === currentStudent.firstName &&
    savedStudent.lastName === currentStudent.lastName &&
    savedStudent.isCreator === currentStudent.isCreator;

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[#05070d] text-slate-100">
      <NeonSceneCanvas
        reducedMotion={reducedMotion}
        isScheduleOpen={isScheduleOpen}
      />

      {!currentStudent ? (
        <StudentLoginGate
          reducedMotion={reducedMotion}
          onLogin={handleLogin}
        />
      ) : (
        <>
          {/* Discreet bottom-right student session & Save / Sign-out controls */}
          {!isScheduleOpen && (
            <div className="pointer-events-none fixed bottom-5 right-5 z-20 flex items-center gap-2">
              <div className="pointer-events-auto flex items-center gap-2 rounded-xl border border-white/10 bg-[#0b0f1a]/90 px-3 py-1.5 text-xs text-slate-300">
                <span className="font-medium text-slate-100">
                  {currentStudent.firstName}
                  {currentStudent.lastName ? ` ${currentStudent.lastName}` : ''}
                </span>

                {currentStudent.isCreator && (
                  <span className="text-[11px] font-medium text-cyan-400">
                    · Editor
                  </span>
                )}

                {!isSaved ? (
                  <button
                    type="button"
                    onClick={handleSaveCurrentStudent}
                    className="flex items-center gap-1 rounded-lg bg-cyan-500 px-2.5 py-1 text-[11px] font-semibold text-slate-950 transition-colors hover:bg-cyan-400 whitespace-nowrap"
                  >
                    <Bookmark className="h-3 w-3" aria-hidden="true" />
                    <span>Save</span>
                  </button>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] font-medium text-cyan-400 whitespace-nowrap">
                    <Check className="h-3 w-3" aria-hidden="true" />
                    <span>Saved</span>
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleSignOut}
                  title="Sign out"
                  aria-label="Sign out"
                  className="flex items-center justify-center rounded-lg p-1 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}

          <AnimatePresence>
            {!isScheduleOpen ? (
              <FloatingScheduleTrigger
                key="trigger"
                onOpenSchedule={() => setIsScheduleOpen(true)}
                reducedMotion={reducedMotion}
              />
            ) : (
              <ScheduleStage
                key="schedule"
                schedule={schedule}
                isCreator={currentStudent.isCreator}
                reducedMotion={reducedMotion}
                onBackToLogo={() => setIsScheduleOpen(false)}
                onUpdatePeriod={handleUpdatePeriod}
                onSyncTimesToAllDays={handleSyncTimesToAllDays}
                onClearDay={handleClearDay}
                onRestoreMonday={handleRestoreMonday}
              />
            )}
          </AnimatePresence>
        </>
      )}

      <div className="pointer-events-none fixed bottom-5 left-5 z-40 text-xs font-medium text-slate-400/55">
        Created by Asrorbek 7 - B LSL Student
      </div>
    </main>
  );
}
