import React from 'react';
import { motion } from 'motion/react';
import { PixelArrowRightIcon, PixelCalendarIcon } from './PixelIcons';

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
        className="pixel-btn pointer-events-auto group relative flex min-h-11 items-center gap-3 border-2 border-cyan-400 bg-[#090d18]/95 px-5 py-2.5 text-sm font-bold text-slate-100 hover:border-cyan-300 hover:bg-[#10182d] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 whitespace-nowrap shrink-0"
      >
        <span className="h-1.5 w-1.5 bg-cyan-400" aria-hidden="true" />
        <PixelCalendarIcon className="h-4 w-4 text-cyan-400 transition-colors group-hover:text-cyan-300" />
        <span className="font-display text-xs tracking-wide sm:text-sm">
          7 - B Class Schedule
        </span>
        <PixelArrowRightIcon className="h-4 w-4 text-pink-400 transition-transform duration-150 group-hover:translate-x-0.5" />
      </motion.button>
    </motion.div>
  );
};
