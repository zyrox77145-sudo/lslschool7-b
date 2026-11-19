import React from 'react';
import { CalendarDays, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface FloatingScheduleTriggerProps {
  onOpenSchedule: () => void;
  reducedMotion: boolean;
}

export const FloatingScheduleTrigger: React.FC<FloatingScheduleTriggerProps> = ({
  onOpenSchedule,
  reducedMotion,
}) => {
  return (
    <motion.div
      initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -56 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -36 }}
      transition={{
        duration: reducedMotion ? 0 : 0.45,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="pointer-events-none fixed inset-x-0 top-6 z-20 flex justify-center px-4"
    >
      <motion.button
        type="button"
        onClick={onOpenSchedule}
        animate={
          reducedMotion
            ? undefined
            : {
                y: [0, -4, 0],
              }
        }
        transition={
          reducedMotion
            ? undefined
            : {
                duration: 3.6,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.45,
              }
        }
        className="pointer-events-auto group flex min-h-11 items-center gap-3 rounded-xl border border-cyan-400/45 bg-[#0b0f1a]/92 px-5 py-2.5 text-sm font-semibold text-slate-100 shadow-[0_0_24px_rgba(34,211,238,0.22)] transition-colors duration-150 hover:border-cyan-300 hover:bg-[#101729] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 whitespace-nowrap shrink-0"
      >
        <CalendarDays
          className="h-4 w-4 text-cyan-400 transition-colors group-hover:text-cyan-300"
          aria-hidden="true"
        />
        <span className="font-display tracking-wide">7 - B Class Schedule</span>
        <ChevronRight
          className="h-4 w-4 text-pink-400 transition-transform duration-150 group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </motion.button>
    </motion.div>
  );
};
