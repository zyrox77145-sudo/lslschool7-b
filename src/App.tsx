import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { FloatingScheduleTrigger } from './components/FloatingScheduleTrigger';
import {
  PixelBookmarkIcon,
  PixelCheckIcon,
  PixelLogOutIcon,
} from './components/PixelIcons';
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
  sanitizeScheduleForFirestore,
  SCHEDULE_STORAGE_KEY,
} from './constants/schedule';
import {
  saveClassScheduleToCloud,
  seedClassScheduleIfMissing,
  subscribeToClassSchedule,
} from './services/scheduleSync';
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
  const scheduleRef = useRef<WeeklySchedule>(schedule);
  const hasSeededCloudRef = useRef(false);
  const [cloudError, setCloudError] = useState<unknown>(null);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  if (cloudError) {
    throw cloudError;
  }

  useEffect(() => {
    scheduleRef.current = schedule;
    try {
      localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(schedule));
    } catch {
      // Ignore storage quota errors gracefully
    }
  }, [schedule]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToClassSchedule(
      (remoteSchedule) => {
        hasSeededCloudRef.current = true;
        scheduleRef.current = remoteSchedule;
        setSchedule(remoteSchedule);
      },
      () => {
        if (!hasSeededCloudRef.current) {
          hasSeededCloudRef.current = true;
          void seedClassScheduleIfMissing(scheduleRef.current).catch((err) => {
            setCloudError(err);
          });
        }
      },
      (err) => {
        setCloudError(err);
      },
    );

    return () => unsubscribe();
  }, []);

  const commitCloudSchedule = useCallback((nextSchedule: WeeklySchedule) => {
    const sanitized = sanitizeScheduleForFirestore(nextSchedule);
    scheduleRef.current = sanitized;
    setSchedule(sanitized);
    void saveClassScheduleToCloud(sanitized).catch((err) => {
      setCloudError(err);
    });
  }, []);

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
      const prev = scheduleRef.current;
      const next: WeeklySchedule = {
        ...prev,
        [day]: prev[day].map((entry) =>
          entry.period === period ? { ...entry, time, subject } : entry,
        ),
      };
      commitCloudSchedule(next);
    },
    [commitCloudSchedule, currentStudent],
  );

  const handleSyncTimesToAllDays = useCallback(
    (sourceDay: DayOfWeek) => {
      if (!currentStudent?.isCreator) return;
      const prev = scheduleRef.current;
      const sourceTimes = prev[sourceDay].map((entry) => entry.time);
      const next: WeeklySchedule = { ...prev };
      for (const day of DAYS_OF_WEEK) {
        next[day] = prev[day].map((entry, idx) => ({
          ...entry,
          time: sourceTimes[idx] ?? entry.time,
        }));
      }
      commitCloudSchedule(next);
    },
    [commitCloudSchedule, currentStudent],
  );

  const handleClearDay = useCallback(
    (day: DayOfWeek) => {
      if (!currentStudent?.isCreator) return;
      const prev = scheduleRef.current;
      const next: WeeklySchedule = {
        ...prev,
        [day]: prev[day].map((entry) => ({ ...entry, subject: '' })),
      };
      commitCloudSchedule(next);
    },
    [commitCloudSchedule, currentStudent],
  );

  const handleRestoreMonday = useCallback(() => {
    if (!currentStudent?.isCreator) return;
    const prev = scheduleRef.current;
    const defaultMonday = createMondayDefaultSchedule();
    const next: WeeklySchedule = {
      ...prev,
      Monday: prev.Monday.map((entry, idx) => ({
        ...entry,
        subject: defaultMonday[idx].subject,
      })),
    };
    commitCloudSchedule(next);
  }, [commitCloudSchedule, currentStudent]);

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

      {/* Subtle crisp CRT pixel scanline texture */}
      <div
        className="pixel-scanlines pointer-events-none fixed inset-0 z-10 opacity-45"
        aria-hidden="true"
      />

      {!currentStudent ? (
        <StudentLoginGate
          reducedMotion={reducedMotion}
          onLogin={handleLogin}
        />
      ) : (
        <>
          {/* Discreet bottom-right pixel student session & Save / Sign-out controls */}
          {!isScheduleOpen && (
            <div className="pointer-events-none fixed bottom-5 right-5 z-20 flex items-center gap-2">
              <div className="pixel-panel-neutral pointer-events-auto flex items-center gap-2.5 px-3 py-1.5 text-xs text-slate-200">
                <span className="font-semibold text-slate-100">
                  {currentStudent.firstName}
                  {currentStudent.lastName ? ` ${currentStudent.lastName}` : ''}
                </span>

                {currentStudent.isCreator && (
                  <span className="font-display text-[10px] font-bold text-cyan-400">
                    · Editor
                  </span>
                )}

                {!isSaved ? (
                  <button
                    type="button"
                    onClick={handleSaveCurrentStudent}
                    className="pixel-btn-sm flex items-center gap-1 border border-cyan-300 bg-cyan-500 px-2.5 py-1 font-display text-[10px] font-bold text-slate-950 hover:bg-cyan-400 whitespace-nowrap"
                  >
                    <PixelBookmarkIcon className="h-3 w-3" />
                    <span>Save</span>
                  </button>
                ) : (
                  <span className="flex items-center gap-1 font-display text-[10px] font-bold text-cyan-400 whitespace-nowrap">
                    <PixelCheckIcon className="h-3 w-3" />
                    <span>Saved</span>
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleSignOut}
                  title="Sign out"
                  aria-label="Sign out"
                  className="flex items-center justify-center p-1 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <PixelLogOutIcon className="h-3.5 w-3.5" />
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

      <div className="pointer-events-none fixed bottom-5 left-5 z-40 font-display text-[11px] font-bold text-slate-400/60">
        Created by Asrorbek 7 - B LSL Student
      </div>
    </main>
  );
}
